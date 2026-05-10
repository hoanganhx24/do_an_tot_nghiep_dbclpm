import 'reflect-metadata';
import { EntityManager, QueryRunner } from 'typeorm';
import { AttemptService } from '../application/services/attempt.service';
import { AppDataSource, closeDatabase, initializeDatabase } from '../infrastructure/database/config';
import { Attempt } from '../domain/entities/attempt.entity';
import { AttemptAnswer } from '../domain/entities/attempt-answer.entity';
import { Choice } from '../domain/entities/choice.entity';
import { Exam } from '../domain/entities/exam.entity';
import { ExamQuestion } from '../domain/entities/exam-question.entity';
import { ExamType } from '../domain/entities/exam-type.entity';
import { MediaQuestion } from '../domain/entities/media-question.entity';
import { Question } from '../domain/entities/question.entity';
import { StudentProfile } from '../domain/entities/student-profile.entity';
import { User } from '../domain/entities/user.entity';

jest.setTimeout(30000);

type CreatedQuestion = {
  question: Question;
  choices: Record<string, Choice>;
};

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

async function createStudent(manager: EntityManager, prefix: string): Promise<StudentProfile> {
  const userRepository = manager.getRepository(User);
  const studentProfileRepository = manager.getRepository(StudentProfile);

  const user = await userRepository.save(
    userRepository.create({
      Email: `${uniqueValue(prefix)}@example.com`,
      Password: 'secret',
      FullName: uniqueValue(`${prefix}-user`),
      Status: 'ACTIVE',
    })
  );

  return await studentProfileRepository.save(
    studentProfileRepository.create({
      UserID: user.ID,
      TargetScore: 700,
      DailyStudyMinutes: 60,
      PlacementLevel: 'INTERMEDIATE',
    })
  );
}

async function createExam(manager: EntityManager, overrides: Partial<Exam> = {}): Promise<Exam> {
  const examTypeRepository = manager.getRepository(ExamType);
  const examRepository = manager.getRepository(Exam);

  const examType = await examTypeRepository.save(
    examTypeRepository.create({
      Code: uniqueValue('FULL_TEST'),
      Description: 'Test exam type',
    })
  );

  return await examRepository.save(
    examRepository.create({
      Title: uniqueValue('TOEIC Full Test'),
      TimeExam: 120,
      Type: 'FULL_TEST',
      ExamTypeID: examType.ID,
      ...overrides,
    })
  );
}

async function createQuestion(
  manager: EntityManager,
  examId: number,
  options: {
    skill: string;
    type: string;
    section: string;
    questionText: string;
    correctAttribute?: string;
  }
): Promise<CreatedQuestion> {
  const mediaRepository = manager.getRepository(MediaQuestion);
  const questionRepository = manager.getRepository(Question);
  const choiceRepository = manager.getRepository(Choice);
  const examQuestionRepository = manager.getRepository(ExamQuestion);

  const media = await mediaRepository.save(
    mediaRepository.create({
      Skill: options.skill,
      Type: options.type,
      Section: options.section,
      Scirpt: `${options.questionText} script`,
    })
  );

  const question = await questionRepository.save(
    questionRepository.create({
      QuestionText: options.questionText,
      MediaQuestionID: media.ID,
    })
  );

  const correctAttribute = options.correctAttribute || 'A';
  const savedChoices = await choiceRepository.save(
    ['A', 'B', 'C', 'D'].map((attribute) =>
      choiceRepository.create({
        QuestionID: question.ID,
        Attribute: attribute,
        Content: `${options.questionText} choice ${attribute}`,
        IsCorrect: attribute === correctAttribute,
      })
    )
  );

  await examQuestionRepository.save(
    examQuestionRepository.create({
      ExamID: examId,
      QuestionID: question.ID,
      OrderIndex: question.ID,
      MediaQuestionID: media.ID,
      IsGrouped: false,
    })
  );

  return {
    question,
    choices: Object.fromEntries(savedChoices.map((choice) => [choice.Attribute, choice])),
  };
}

async function createAttempt(
  manager: EntityManager,
  overrides: Partial<Attempt>
): Promise<Attempt> {
  const attemptRepository = manager.getRepository(Attempt);

  return await attemptRepository.save(
    attemptRepository.create({
      Type: 'FULL_TEST',
      SubmittedAt: null,
      ScorePercent: null as any,
      ScoreListening: null as any,
      ScoreReading: null as any,
      ...overrides,
    })
  );
}

async function createAttemptAnswer(
  manager: EntityManager,
  attemptId: number,
  questionId: number,
  choiceId: number,
  isCorrect: boolean
): Promise<AttemptAnswer> {
  const attemptAnswerRepository = manager.getRepository(AttemptAnswer);

  return await attemptAnswerRepository.save(
    attemptAnswerRepository.create({
      AttemptID: attemptId,
      QuestionID: questionId,
      ChoiceID: choiceId,
      IsCorrect: isCorrect,
    })
  );
}

describe('AttemptService', () => {
  let queryRunner: QueryRunner;
  let manager: EntityManager;
  let service: AttemptService;
  let getRepositorySpy: jest.SpyInstance;
  let transactionSpy: jest.SpyInstance;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }
  });

  beforeEach(async () => {
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    manager = queryRunner.manager;

    getRepositorySpy = jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation(((target: any) => manager.getRepository(target)) as any);

    transactionSpy = jest
      .spyOn(AppDataSource, 'transaction')
      .mockImplementation((async (arg1: any, arg2?: any) => {
        const callback = typeof arg1 === 'function' ? arg1 : arg2;
        return callback(manager);
      }) as any);

    service = new AttemptService();
  });

  afterEach(async () => {
    getRepositorySpy.mockRestore();
    transactionSpy.mockRestore();

    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    await queryRunner.release();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Hàm: startAttempt() - Bắt đầu làm bài thi', () => {
    it('TC-TRINH-ATT-001 — Không thể bắt đầu thi nếu ExamID không tồn tại', async () => {
      await expect(
        service.startAttempt({ ExamID: 999999, Type: 'FULL_TEST' } as any, 20)
      ).rejects.toThrow('Exam not found');
    });

    it('TC-TRINH-ATT-002 — Ở chế độ PRACTICE_BY_PART, học sinh phải chọn ít nhất 1 Part', async () => {
      const exam = await createExam(manager);

      await expect(
        service.startAttempt(
          { ExamID: exam.ID, Type: 'PRACTICE_BY_PART', Parts: [] } as any,
          20
        )
      ).rejects.toThrow('Parts must be specified');
    });

    it('TC-TRINH-ATT-003 — Không cho phép chọn Part ngoài khoảng [1-7]', async () => {
      const exam = await createExam(manager);

      await expect(
        service.startAttempt(
          { ExamID: exam.ID, Type: 'PRACTICE_BY_PART', Parts: [0, 8] } as any,
          20
        )
      ).rejects.toThrow(/Invalid part numbers/);
    });

    it('TC-TRINH-ATT-004 — Bắt đầu bài làm FULL_TEST thành công, điểm khởi tạo là rỗng', async () => {
      const student = await createStudent(manager, 'start-full');
      const exam = await createExam(manager);

      const result = await service.startAttempt(
        { ExamID: exam.ID, Type: 'FULL_TEST' } as any,
        student.ID
      );

      const savedAttempt = await manager.getRepository(Attempt).findOneByOrFail({ ID: result.ID });

      expect(result.ID).toBeGreaterThan(0);
      expect(savedAttempt.ScorePercent).toBeNull();
      expect(savedAttempt.ScoreListening).toBeNull();
      expect(savedAttempt.ScoreReading).toBeNull();
    });

    it('TC-TRINH-ATT-005 — Bắt đầu bài làm PRACTICE_BY_PART thành công với các Part hợp lệ', async () => {
      const student = await createStudent(manager, 'start-part');
      const exam = await createExam(manager, { TimeExam: 60 });

      const result = await service.startAttempt(
        { ExamID: exam.ID, Type: 'PRACTICE_BY_PART', Parts: [1, 3, 5] } as any,
        student.ID
      );

      const savedAttempt = await manager.getRepository(Attempt).findOneByOrFail({ ID: result.ID });
      expect(result.ID).toBeGreaterThan(0);
      expect(savedAttempt.Type).toBe('PRACTICE_BY_PART');
    });

    it('TC-TRINH-ATT-006 — Luyện tập theo part không được phép chọn các part trùng lặp', async () => {
      const exam = await createExam(manager);

      await expect(
        service.startAttempt(
          { ExamID: exam.ID, Type: 'PRACTICE_BY_PART', Parts: [1, 1, 5] } as any,
          20
        )
      ).rejects.toThrow('Duplicate parts are not allowed');
    });
  });

  describe('Hàm: submitAttempt() - Nộp bài thi', () => {
    it('TC-TRINH-ATT-007 — Học sinh không được phép nộp bài thi của người khác', async () => {
      const currentStudent = await createStudent(manager, 'submit-current');
      const owner = await createStudent(manager, 'submit-owner');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: owner.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(30),
      });

      await expect(
        service.submitAttempt({ AttemptID: attempt.ID, answers: [] } as any, currentStudent.ID)
      ).rejects.toThrow('You can only submit your own attempts');
    });

    it('TC-TRINH-ATT-008 — Không cho phép nộp lại một bài thi đã được nộp trước đó', async () => {
      const student = await createStudent(manager, 'submit-repeat');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(30),
        SubmittedAt: new Date(),
      });

      await expect(
        service.submitAttempt({ AttemptID: attempt.ID, answers: [] } as any, student.ID)
      ).rejects.toThrow('already been submitted');
    });

    it('TC-TRINH-ATT-009 — Hệ thống không cho nộp bài thi sau khi đã hết giờ', async () => {
      const student = await createStudent(manager, 'submit-overtime');
      const exam = await createExam(manager, { TimeExam: 120 });
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(150), // Bắt đầu từ 150 phút trước, đề thi chỉ có 120 phút → đã hết giờ
        Type: 'FULL_TEST',
        SubmittedAt: null,
      });

      // Kỳ vọng: hệ thống phải chặn và ném lỗi khi học sinh nộp bài sau khi đã hết giờ
      await expect(
        service.submitAttempt({ AttemptID: attempt.ID, answers: [] } as any, student.ID)
      ).rejects.toThrow('Time limit exceeded');
    });

    it('TC-TRINH-ATT-010 — Nộp bài thành công hợp lệ, hệ thống trả về điểm số đầy đủ', async () => {
      const student = await createStudent(manager, 'submit-score');
      const exam = await createExam(manager);
      const listeningQuestion = await createQuestion(manager, exam.ID, {
        skill: 'LISTENING',
        type: 'PHOTO_DESCRIPTION',
        section: 'Part 1',
        questionText: 'Listening question score',
      });
      const readingQuestion = await createQuestion(manager, exam.ID, {
        skill: 'READING',
        type: 'INCOMPLETE_SENTENCE',
        section: 'Part 5',
        questionText: 'Reading question score',
      });
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(30),
      });

      const result = await service.submitAttempt(
        {
          AttemptID: attempt.ID,
          answers: [
            {
              QuestionID: listeningQuestion.question.ID,
              ChoiceID: listeningQuestion.choices.A.ID,
            },
            {
              QuestionID: readingQuestion.question.ID,
              ChoiceID: readingQuestion.choices.A.ID,
            },
          ],
        } as any,
        student.ID
      );

      expect(result.Scores.ScoreListening).toBe(495);
      expect(result.Scores.ScoreReading).toBe(495);
      expect(result.Scores.TotalScore).toBe(990);
    });

    it('TC-TRINH-ATT-011 — Học sinh không được phép chọn nhiều hơn 1 đáp án cho cùng 1 câu hỏi', async () => {
      const student = await createStudent(manager, 'submit-duplicate-answer');
      const exam = await createExam(manager);
      const question = await createQuestion(manager, exam.ID, {
        skill: 'READING',
        type: 'INCOMPLETE_SENTENCE',
        section: 'Part 5',
        questionText: 'Duplicate answer question',
      });
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(20),
      });

      await expect(
        service.submitAttempt(
          {
            AttemptID: attempt.ID,
            answers: [
              { QuestionID: question.question.ID, ChoiceID: question.choices.A.ID },
              { QuestionID: question.question.ID, ChoiceID: question.choices.B.ID },
            ],
          } as any,
          student.ID
        )
      ).rejects.toThrow(/Duplicate answers for question/);
    });
  });

  describe('Hàm: getAttemptResults() - Lấy kết quả điểm số', () => {
    it('TC-TRINH-ATT-012 — Học sinh không được phép xem điểm và kết quả bài làm của người khác', async () => {
      const currentStudent = await createStudent(manager, 'result-current');
      const owner = await createStudent(manager, 'result-owner');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: owner.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(45),
        SubmittedAt: new Date(),
        ScorePercent: 60,
        ScoreListening: 300,
        ScoreReading: 300,
      });

      await expect(service.getAttemptResults(attempt.ID, currentStudent.ID)).rejects.toThrow(
        'only view your own'
      );
    });

    it('TC-TRINH-ATT-013 — Không cho xem kết quả bài thi khi chưa nộp bài', async () => {
      const student = await createStudent(manager, 'result-not-submitted');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(15),
        SubmittedAt: null,
      });

      await expect(service.getAttemptResults(attempt.ID, student.ID)).rejects.toThrow(
        'not been submitted yet'
      );
    });

    it('TC-TRINH-ATT-014 — Xem kết quả bài thi thành công và tính đúng thời gian làm bài', async () => {
      const student = await createStudent(manager, 'result-success');
      const exam = await createExam(manager, { Title: 'Result Exam' });
      const listeningQuestion = await createQuestion(manager, exam.ID, {
        skill: 'LISTENING',
        type: 'PHOTO_DESCRIPTION',
        section: 'Part 1',
        questionText: 'Listening result question',
      });
      const readingQuestion = await createQuestion(manager, exam.ID, {
        skill: 'READING',
        type: 'INCOMPLETE_SENTENCE',
        section: 'Part 5',
        questionText: 'Reading result question',
      });
      const startedAt = minutesAgo(90);
      const submittedAt = new Date();
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: startedAt,
        SubmittedAt: submittedAt,
        ScorePercent: 75,
        ScoreListening: 350,
        ScoreReading: 400,
      });

      await createAttemptAnswer(
        manager,
        attempt.ID,
        listeningQuestion.question.ID,
        listeningQuestion.choices.A.ID,
        true
      );
      await createAttemptAnswer(
        manager,
        attempt.ID,
        readingQuestion.question.ID,
        readingQuestion.choices.B.ID,
        false
      );

      const result = await service.getAttemptResults(attempt.ID, student.ID);

      expect(result.AttemptID).toBe(attempt.ID);
      expect(result.Scores.TotalScore).toBe(750);
      expect(result.TimeTaken).toBeGreaterThanOrEqual(89);
    });
  });

  describe('Hàm: deleteAttempt() - Xóa lịch sử bài làm', () => {
    it('TC-TRINH-ATT-015 — Học sinh không được phép xóa lịch sử làm bài của người khác', async () => {
      const currentStudent = await createStudent(manager, 'delete-current');
      const owner = await createStudent(manager, 'delete-owner');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: owner.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(20),
      });

      await expect(service.deleteAttempt(attempt.ID, currentStudent.ID)).rejects.toThrow(
        'only delete your own'
      );
    });

    it('TC-TRINH-ATT-016 — Học sinh xóa lịch sử bài làm của chính mình thành công', async () => {
      const student = await createStudent(manager, 'delete-own');
      const exam = await createExam(manager);
      const attempt = await createAttempt(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
        StartedAt: minutesAgo(20),
      });

      const result = await service.deleteAttempt(attempt.ID, student.ID);
      const deletedAttempt = await manager.getRepository(Attempt).findOneBy({ ID: attempt.ID });

      expect(result).toBe(true);
      expect(deletedAttempt).toBeNull();
    });
  });
});
