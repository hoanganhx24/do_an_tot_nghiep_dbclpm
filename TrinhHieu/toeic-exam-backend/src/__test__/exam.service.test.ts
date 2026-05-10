import 'reflect-metadata';
import { EntityManager, QueryRunner } from 'typeorm';
import { ExamService } from '../application/services/exam.service';
import { AppDataSource, closeDatabase, initializeDatabase } from '../infrastructure/database/config';
import { Attempt } from '../domain/entities/attempt.entity';
import { Choice } from '../domain/entities/choice.entity';
import { Exam } from '../domain/entities/exam.entity';
import { ExamQuestion } from '../domain/entities/exam-question.entity';
import { ExamType } from '../domain/entities/exam-type.entity';
import { MediaQuestion } from '../domain/entities/media-question.entity';
import { Question } from '../domain/entities/question.entity';
import { StudentProfile } from '../domain/entities/student-profile.entity';
import { User } from '../domain/entities/user.entity';

jest.setTimeout(30000);

function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

async function createStudent(manager: EntityManager, prefix: string): Promise<StudentProfile> {
  const userRepository = manager.getRepository(User);
  const profileRepository = manager.getRepository(StudentProfile);

  const user = await userRepository.save(
    userRepository.create({
      Email: `${uniqueValue(prefix)}@example.com`,
      Password: 'secret',
      FullName: uniqueValue(`${prefix}-user`),
      Status: 'ACTIVE',
    })
  );

  return await profileRepository.save(
    profileRepository.create({
      UserID: user.ID,
      TargetScore: 700,
      DailyStudyMinutes: 60,
      PlacementLevel: 'INTERMEDIATE',
    })
  );
}

async function createExamTypeRecord(
  manager: EntityManager,
  overrides: Partial<ExamType> = {}
): Promise<ExamType> {
  const repository = manager.getRepository(ExamType);
  return await repository.save(
    repository.create({
      Code: uniqueValue('EXAM_TYPE'),
      Description: 'Loai de thi test',
      ...overrides,
    })
  );
}

async function createExamRecord(
  manager: EntityManager,
  userId: number,
  overrides: Partial<Exam> = {}
): Promise<Exam> {
  const examType = overrides.ExamTypeID
    ? await manager.getRepository(ExamType).findOneByOrFail({ ID: overrides.ExamTypeID })
    : await createExamTypeRecord(manager, { Code: uniqueValue('FULL_TEST') });
  const repository = manager.getRepository(Exam);

  return await repository.save(
    repository.create({
      Title: uniqueValue('De thi TOEIC'),
      TimeExam: 120,
      Type: 'FULL_TEST',
      UserID: userId,
      ExamTypeID: examType.ID,
      ...overrides,
    })
  );
}

async function createMediaQuestion(
  manager: EntityManager,
  overrides: Partial<MediaQuestion> = {}
): Promise<MediaQuestion> {
  const repository = manager.getRepository(MediaQuestion);
  return await repository.save(
    repository.create({
      Skill: 'READING',
      Type: 'READING_COMPREHENSION',
      Section: 'Part 7',
      GroupTitle: uniqueValue('Media Group'),
      Scirpt: 'Script',
      ...overrides,
    })
  );
}

async function createQuestionRecord(
  manager: EntityManager,
  overrides: Partial<Question> = {},
  choiceOverrides?: Array<Partial<Choice>>
): Promise<Question> {
  const media =
    overrides.MediaQuestionID !== undefined
      ? await manager.getRepository(MediaQuestion).findOneByOrFail({ ID: overrides.MediaQuestionID })
      : await createMediaQuestion(manager);
  const questionRepository = manager.getRepository(Question);
  const choiceRepository = manager.getRepository(Choice);

  const question = await questionRepository.save(
    questionRepository.create({
      QuestionText: uniqueValue('Question'),
      MediaQuestionID: media.ID,
      OrderInGroup: 1,
      ...overrides,
    })
  );

  const choices = choiceOverrides || [
    { Attribute: 'A', Content: 'Choice A', IsCorrect: true },
    { Attribute: 'B', Content: 'Choice B', IsCorrect: false },
    { Attribute: 'C', Content: 'Choice C', IsCorrect: false },
    { Attribute: 'D', Content: 'Choice D', IsCorrect: false },
  ];

  await choiceRepository.save(
    choices.map((choice) =>
      choiceRepository.create({
        QuestionID: question.ID,
        Attribute: choice.Attribute,
        Content: choice.Content,
        IsCorrect: choice.IsCorrect,
      })
    )
  );

  return await questionRepository.findOneOrFail({
    where: { ID: question.ID },
    relations: ['mediaQuestion', 'choices'],
  });
}

async function attachQuestionToExam(
  manager: EntityManager,
  examId: number,
  questionId: number,
  orderIndex: number,
  overrides: Partial<ExamQuestion> = {}
): Promise<ExamQuestion> {
  const repository = manager.getRepository(ExamQuestion);
  return await repository.save(
    repository.create({
      ExamID: examId,
      QuestionID: questionId,
      OrderIndex: orderIndex,
      ...overrides,
    })
  );
}

async function createAttemptRecord(
  manager: EntityManager,
  overrides: Partial<Attempt>
): Promise<Attempt> {
  const repository = manager.getRepository(Attempt);
  return await repository.save(
    repository.create({
      StudentProfileID: overrides.StudentProfileID!,
      ExamID: overrides.ExamID!,
      Type: 'FULL_TEST',
      SubmittedAt: null,
      ScorePercent: null as any,
      ScoreListening: null as any,
      ScoreReading: null as any,
      ...overrides,
    })
  );
}

describe('ExamService', () => {
  let queryRunner: QueryRunner;
  let manager: EntityManager;
  let service: ExamService;
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

    service = new ExamService();
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

  describe('Hàm: createExam() - Tạo đề thi mới', () => {
    it('TC-TRINH-EXM-001 — Không cho phép tạo đề thi khi thiếu tiêu đề', async () => {
      const examType = await createExamTypeRecord(manager);

      await expect(
        service.createExam(
          { Title: '   ', TimeExam: 120, Type: 'FULL_TEST', ExamTypeID: examType.ID } as any,
          5
        )
      ).rejects.toThrow('Exam title cannot be empty');
    });

    it('TC-TRINH-EXM-002 — Không cho phép tạo đề thi nếu danh sách câu hỏi có câu không tồn tại', async () => {
      const examType = await createExamTypeRecord(manager);
      const question = await createQuestionRecord(manager);

      await expect(
        service.createExam(
          {
            Title: 'De luyen tap Part 5',
            TimeExam: 30,
            Type: 'PRACTICE',
            ExamTypeID: examType.ID,
            questions: [
              { QuestionID: question.ID, OrderIndex: 1 },
              { QuestionID: 999999, OrderIndex: 2 },
            ],
          } as any,
          5
        )
      ).rejects.toThrow('Some questions do not exist');
    });

    it('TC-TRINH-EXM-003 — Tạo đề thi thành công và tự nối tiếp thứ tự khi vừa chọn câu lẻ vừa chọn media group', async () => {
      const examType = await createExamTypeRecord(manager);
      const singleQuestion = await createQuestionRecord(manager);
      const media = await createMediaQuestion(manager, { GroupTitle: 'Part 7 - Set 1' });
      const mediaQuestion1 = await createQuestionRecord(manager, {
        MediaQuestionID: media.ID,
        OrderInGroup: 1,
      });
      const mediaQuestion2 = await createQuestionRecord(manager, {
        MediaQuestionID: media.ID,
        OrderInGroup: 2,
      });

      const result = await service.createExam(
        {
          Title: 'De tong hop Listening',
          TimeExam: 45,
          Type: 'MINI_TEST',
          ExamTypeID: examType.ID,
          questions: [{ QuestionID: singleQuestion.ID, OrderIndex: 1 }],
          MediaQuestionIDs: [media.ID],
        } as any,
        5
      );

      expect(result.ID).toBeGreaterThan(0);
      expect(result.examQuestions.length).toBe(3);
      expect(result.examQuestions.map((item) => item.OrderIndex)).toEqual([1, 2, 3]);
      expect(result.examQuestions.map((item) => item.QuestionID)).toEqual([
        singleQuestion.ID,
        mediaQuestion1.ID,
        mediaQuestion2.ID,
      ]);
    });

    it('TC-TRINH-EXM-004 — Báo lỗi với TimeExam không hợp lệ và media group không có câu hỏi', async () => {
      const examType = await createExamTypeRecord(manager);
      const emptyMedia = await createMediaQuestion(manager, { GroupTitle: 'Empty media set' });

      await expect(
        service.createExam(
          {
            Title: 'De sai time',
            TimeExam: 0,
            Type: 'FULL_TEST',
            ExamTypeID: examType.ID,
          } as any,
          5
        )
      ).rejects.toThrow('Exam time must be between 1 and 240 minutes');

      await expect(
        service.createExam(
          {
            Title: 'De media rong',
            TimeExam: 60,
            Type: 'FULL_TEST',
            ExamTypeID: examType.ID,
            MediaQuestionIDs: [emptyMedia.ID],
          } as any,
          5
        )
      ).rejects.toThrow('No questions found for selected media blocks');
    });
  });

  describe('Hàm: getExamById() - Lấy chi tiết đề thi', () => {
    it('TC-TRINH-EXM-005 — Trả về đúng đề thi với câu hỏi và choices ẩn đáp án đúng', async () => {
      const exam = await createExamRecord(manager, 5, { Title: 'Exam Detail' });
      const question = await createQuestionRecord(manager, {
        QuestionText: 'Question detail',
      });
      await attachQuestionToExam(manager, exam.ID, question.ID, 1);

      const result = await service.getExamById(exam.ID);

      expect(result.ID).toBe(exam.ID);
      expect(result.Title).toBe('Exam Detail');
      expect(result.Questions).toHaveLength(1);
      expect(result.Questions[0].Choices[0]).not.toHaveProperty('IsCorrect');
    });

    it('TC-TRINH-EXM-006 — Báo lỗi khi đề thi không tồn tại', async () => {
      await expect(service.getExamById(999999)).rejects.toThrow('Exam not found');
    });
  });

  describe('Hàm: getAllExams() - Lấy danh sách đề thi', () => {
    it('TC-TRINH-EXM-007 — Chỉ trả về đúng đề thi theo bộ lọc Type', async () => {
      await createExamRecord(manager, 5, { Type: 'FULL_TEST' });
      await createExamRecord(manager, 5, { Type: 'MINI_TEST' });

      const result = await service.getAllExams({ Type: 'MINI_TEST' });

      expect(result).toHaveLength(1);
      expect(result[0].Type).toBe('MINI_TEST');
    });
  });

  describe('Hàm: updateExam() - Cập nhật thông tin đề thi', () => {
    it('TC-TRINH-EXM-008 — Báo lỗi khi đề thi không tồn tại', async () => {
      await expect(
        service.updateExam(999999, { Title: 'Khong ton tai' } as any, 5)
      ).rejects.toThrow('Exam not found');
    });

    it('TC-TRINH-EXM-009 — Chỉ người tạo đề thi mới được sửa thông tin cơ bản của đề thi', async () => {
      const ownerId = 9;
      const exam = await createExamRecord(manager, ownerId);

      await expect(
        service.updateExam(exam.ID, { Title: 'Doi tieu de trai phep' }, 5)
      ).rejects.toThrow('You do not have permission to update this exam');
    });

    it('TC-TRINH-EXM-010 — Báo lỗi khi TimeExam không hợp lệ', async () => {
      const exam = await createExamRecord(manager, 5);

      await expect(service.updateExam(exam.ID, { TimeExam: 999 } as any, 5)).rejects.toThrow(
        'Exam time must be between 1 and 240 minutes'
      );
    });

    it('TC-TRINH-EXM-011 — Cập nhật thành công thông tin đề thi khi đúng chủ sở hữu và dữ liệu hợp lệ', async () => {
      const exam = await createExamRecord(manager, 5);

      const result = await service.updateExam(
        exam.ID,
        { Title: 'De thi TOEIC cap nhat', TimeExam: 90 },
        5
      );

      expect(result.Title).toBe('De thi TOEIC cap nhat');
      expect(result.TimeExam).toBe(90);
    });
  });

  describe('Hàm: deleteExam() - Xóa đề thi', () => {
    it('TC-TRINH-EXM-012 — Không cho phép xóa đề thi đã có học sinh làm bài', async () => {
      const student = await createStudent(manager, 'attempt-student');
      const exam = await createExamRecord(manager, 5);
      await createAttemptRecord(manager, {
        StudentProfileID: student.ID,
        ExamID: exam.ID,
      });

      await expect(service.deleteExam(exam.ID, 5)).rejects.toThrow(
        /Cannot delete exam that has been taken by students/
      );
    });

    it('TC-TRINH-EXM-013 — Không cho phép người không sở hữu đề thi thực hiện thao tác xóa', async () => {
      const exam = await createExamRecord(manager, 8);

      await expect(service.deleteExam(exam.ID, 5)).rejects.toThrow(
        'You do not have permission to delete this exam'
      );
    });

    it('TC-TRINH-EXM-014 — Cho phép xóa đề thi chưa phát sinh lượt làm bài', async () => {
      const exam = await createExamRecord(manager, 5);

      const result = await service.deleteExam(exam.ID, 5);
      const deleted = await manager.getRepository(Exam).findOneBy({ ID: exam.ID });

      expect(result).toBe(true);
      expect(deleted).toBeNull();
    });
  });

  describe('Hàm: addQuestionsToExam() - Thêm câu hỏi lẻ vào đề thi', () => {
    it('TC-TRINH-EXM-015 — Không cho phép thêm lại câu hỏi đã nằm sẵn trong đề thi', async () => {
      const exam = await createExamRecord(manager, 5);
      const question = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, question.ID, 1);

      await expect(
        service.addQuestionsToExam(exam.ID, [{ QuestionID: question.ID, OrderIndex: 2 }], 5)
      ).rejects.toThrow(/already in this exam/);
    });

    it('TC-TRINH-EXM-016 — Không nên cho phép admin gán trùng OrderIndex cho hai câu mới', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);

      await expect(
        service.addQuestionsToExam(
          exam.ID,
          [
            { QuestionID: question1.ID, OrderIndex: 3 },
            { QuestionID: question2.ID, OrderIndex: 3 },
          ],
          5
        )
      ).rejects.toThrow(/order/i);
    });

    it('TC-TRINH-EXM-017 — Thêm thành công nhiều câu hỏi mới khi thứ tự không xung đột', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);

      const result = await service.addQuestionsToExam(
        exam.ID,
        [
          { QuestionID: question1.ID, OrderIndex: 2 },
          { QuestionID: question2.ID, OrderIndex: 3 },
        ],
        5
      );

      expect(result.examQuestions).toHaveLength(2);
      expect(result.examQuestions.map((item) => item.QuestionID)).toEqual([
        question1.ID,
        question2.ID,
      ]);
    });
  });

  describe('Hàm: removeQuestionsFromExam() - Xóa câu hỏi lẻ khỏi đề thi', () => {
    it('TC-TRINH-EXM-018 — Báo lỗi khi đề thi không tồn tại', async () => {
      await expect(service.removeQuestionsFromExam(999999, [1], 5)).rejects.toThrow('Exam not found');
    });

    it('TC-TRINH-EXM-019 — Không cho phép thao tác nếu không phải chủ sở hữu đề', async () => {
      const exam = await createExamRecord(manager, 5);

      await expect(service.removeQuestionsFromExam(exam.ID, [1], 999)).rejects.toThrow(
        'You do not have permission to modify this exam'
      );
    });

    it('TC-TRINH-EXM-020 — Xóa thành công câu hỏi khỏi đề thi khi đúng chủ sở hữu', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, question1.ID, 1);
      await attachQuestionToExam(manager, exam.ID, question2.ID, 2);

      const removed = await service.removeQuestionsFromExam(exam.ID, [question1.ID], 5);
      const reloaded = await manager.getRepository(Exam).findOne({
        where: { ID: exam.ID },
        relations: ['examQuestions'],
      });

      expect(removed).toBe(1);
      expect(reloaded?.examQuestions.map((item) => item.QuestionID)).toEqual([question2.ID]);
    });
  });

  describe('Hàm: searchExams() - Tìm kiếm đề thi', () => {
    it('TC-TRINH-EXM-021 — Tìm đúng đề thi theo tiêu đề', async () => {
      await createExamRecord(manager, 5, { Title: 'Target Exam Search' });
      await createExamRecord(manager, 5, { Title: 'Other Title' });

      const result = await service.searchExams('Target');

      expect(result).toHaveLength(1);
      expect(result[0].Title).toContain('Target');
    });

    it('TC-TRINH-EXM-022 — Báo lỗi khi từ khóa tìm kiếm rỗng', async () => {
      await expect(service.searchExams('   ')).rejects.toThrow('Search term cannot be empty');
    });
  });

  describe('Hàm: addMediaGroupToExam() - Thêm media group vào đề thi', () => {
    it('TC-TRINH-EXM-023 — Không cho phép thêm một media group đã có sẵn trong đề thi', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager, { GroupTitle: 'Part 7 - Set 1' });
      const question = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      await attachQuestionToExam(manager, exam.ID, question.ID, 1, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });

      await expect(service.addMediaGroupToExam(exam.ID, media.ID, 10, 5)).rejects.toThrow(
        'This media group is already in the exam'
      );
    });

    it('TC-TRINH-EXM-024 — Không cho phép đưa một media group rỗng vào đề thi', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager, { GroupTitle: 'Part 3 - Set 2' });

      await expect(service.addMediaGroupToExam(exam.ID, media.ID, 5, 5)).rejects.toThrow(
        'Media group has no questions'
      );
    });

    it('TC-TRINH-EXM-025 — Thêm thành công cả cụm media và hệ thống tự tính dải OrderIndex liên tiếp', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager, { GroupTitle: 'Part 7 - Double passage' });
      await createQuestionRecord(manager, { MediaQuestionID: media.ID, OrderInGroup: 1 });
      await createQuestionRecord(manager, { MediaQuestionID: media.ID, OrderInGroup: 2 });
      await createQuestionRecord(manager, { MediaQuestionID: media.ID, OrderInGroup: 3 });

      const result = await service.addMediaGroupToExam(exam.ID, media.ID, 11, 5);

      expect(result.questionsAdded).toBe(3);
      expect(result.startOrderIndex).toBe(11);
      expect(result.endOrderIndex).toBe(13);
    });
  });

  describe('Hàm: getExamContentOrganized() - Lấy nội dung đề thi đã sắp nhóm', () => {
    it('TC-TRINH-EXM-026 — Trả về đúng media groups và standalone questions', async () => {
      const exam = await createExamRecord(manager, 5);
      const groupedMedia = await createMediaQuestion(manager, { GroupTitle: 'Grouped Media' });
      const standaloneMedia = await createMediaQuestion(manager, {
        GroupTitle: 'Standalone Media',
        Type: 'INCOMPLETE_SENTENCE',
        Section: 'Part 5',
      });
      const groupedQuestion1 = await createQuestionRecord(manager, {
        MediaQuestionID: groupedMedia.ID,
        OrderInGroup: 1,
      });
      const groupedQuestion2 = await createQuestionRecord(manager, {
        MediaQuestionID: groupedMedia.ID,
        OrderInGroup: 2,
      });
      const standaloneQuestion = await createQuestionRecord(manager, {
        MediaQuestionID: standaloneMedia.ID,
      });
      await attachQuestionToExam(manager, exam.ID, groupedQuestion1.ID, 1, {
        MediaQuestionID: groupedMedia.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, groupedQuestion2.ID, 2, {
        MediaQuestionID: groupedMedia.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, standaloneQuestion.ID, 3, {
        IsGrouped: false,
      });

      const result = await service.getExamContentOrganized(exam.ID);

      expect(result.mediaGroups).toHaveLength(1);
      expect(result.mediaGroups[0].questions).toHaveLength(2);
      expect(result.standaloneQuestions).toHaveLength(1);
    });
  });

  describe('Hàm: moveMediaGroupInExam() - Di chuyển media group trong đề thi', () => {
    it('TC-TRINH-EXM-027 — Di chuyển thành công cả nhóm media sang vị trí mới', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager);
      const question1 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      const question2 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      await attachQuestionToExam(manager, exam.ID, question1.ID, 5, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, question2.ID, 6, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });

      const moved = await service.moveMediaGroupInExam(exam.ID, media.ID, 1, 5);
      const movedQuestions = await manager.getRepository(ExamQuestion).find({
        where: { ExamID: exam.ID, MediaQuestionID: media.ID },
        order: { OrderIndex: 'ASC' },
      });

      expect(moved).toBe(2);
      expect(movedQuestions.map((item) => item.OrderIndex)).toEqual([1, 2]);
    });
  });

  describe('Hàm: validateExamStructure() - Kiểm tra cấu trúc đề thi', () => {
    it('TC-TRINH-EXM-028 — Báo lỗi duplicate OrderIndex khi cấu trúc đề bị trùng thứ tự', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, question1.ID, 1);
      await attachQuestionToExam(manager, exam.ID, question2.ID, 1);

      const result = await service.validateExamStructure(exam.ID);

      expect(result.isValid).toBe(false);
      expect(result.issues.some((issue) => issue.includes('Duplicate OrderIndex'))).toBe(true);
    });
  });

  describe('Hàm: compactExamOrder() - Nén lại thứ tự đề thi', () => {
    it('TC-TRINH-EXM-029 — Nén lại sequence OrderIndex khi có khoảng trống', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, question1.ID, 2);
      await attachQuestionToExam(manager, exam.ID, question2.ID, 5);

      const updatedCount = await service.compactExamOrder(exam.ID, 5);
      const reloaded = await manager.getRepository(ExamQuestion).find({
        where: { ExamID: exam.ID },
        order: { OrderIndex: 'ASC' },
      });

      expect(updatedCount).toBe(2);
      expect(reloaded.map((item) => item.OrderIndex)).toEqual([1, 2]);
    });
  });

  describe('Hàm: removeMediaGroupFromExam() - Xóa media group khỏi đề thi', () => {
    it('TC-TRINH-EXM-030 — Không cho phép xóa media group nếu người thao tác không phải chủ sở hữu đề', async () => {
      const exam = await createExamRecord(manager, 9);

      await expect(service.removeMediaGroupFromExam(exam.ID, 4, 5)).rejects.toThrow(
        'You do not have permission to modify this exam'
      );
    });

    it('TC-TRINH-EXM-031 — Không thể bỏ chọn một media group vốn không nằm trong đề thi', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager);

      await expect(service.removeMediaGroupFromExam(exam.ID, media.ID, 5)).rejects.toThrow(
        'Media group not found in this exam'
      );
    });

    it('TC-TRINH-EXM-032 — Xóa thành công toàn bộ câu hỏi thuộc một media group đã gán vào đề thi', async () => {
      const exam = await createExamRecord(manager, 5);
      const media = await createMediaQuestion(manager);
      const question1 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      const question2 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      const question3 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      await attachQuestionToExam(manager, exam.ID, question1.ID, 1, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, question2.ID, 2, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, question3.ID, 3, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });

      const removed = await service.removeMediaGroupFromExam(exam.ID, media.ID, 5);

      expect(removed).toBe(3);
    });
  });

  describe('Hàm: duplicateExam() - Nhân bản đề thi', () => {
    it('TC-TRINH-EXM-033 — Không thể nhân bản một đề thi không tồn tại trong hệ thống', async () => {
      await expect(service.duplicateExam(999999, 5)).rejects.toThrow('Exam not found');
    });

    it('TC-TRINH-EXM-034 — Nhân bản thành công đề thi kèm toàn bộ câu hỏi và thông tin media group', async () => {
      const exam = await createExamRecord(manager, 5, { Title: 'De goc' });
      const media = await createMediaQuestion(manager);
      const question1 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      const question2 = await createQuestionRecord(manager, { MediaQuestionID: media.ID });
      await attachQuestionToExam(manager, exam.ID, question1.ID, 1, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });
      await attachQuestionToExam(manager, exam.ID, question2.ID, 2, {
        MediaQuestionID: media.ID,
        IsGrouped: true,
      });

      const result = await service.duplicateExam(exam.ID, 99);

      expect(result.ID).toBeGreaterThan(0);
      expect(result.Title).toBe('De goc - Copy');
      expect(result.UserID).toBe(99);
      expect(result.examQuestions).toHaveLength(2);
    });
  });

  describe('Hàm: replaceQuestionInExam() - Thay câu hỏi trong đề thi', () => {
    it('TC-TRINH-EXM-035 — Không cho phép thay bằng một câu hỏi mới không tồn tại', async () => {
      const exam = await createExamRecord(manager, 5);
      const oldQuestion = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, oldQuestion.ID, 7, { IsGrouped: false });

      await expect(service.replaceQuestionInExam(exam.ID, oldQuestion.ID, 999999, 5)).rejects.toThrow(
        'New question not found'
      );
    });

    it('TC-TRINH-EXM-036 — Không cho phép thay bằng câu hỏi thuộc media group khác', async () => {
      const exam = await createExamRecord(manager, 5);
      const mediaA = await createMediaQuestion(manager, { GroupTitle: 'Media A' });
      const mediaB = await createMediaQuestion(manager, { GroupTitle: 'Media B' });
      const oldGroupedQuestion = await createQuestionRecord(manager, {
        MediaQuestionID: mediaA.ID,
        OrderInGroup: 1,
      });
      const wrongMediaQuestion = await createQuestionRecord(manager, {
        MediaQuestionID: mediaB.ID,
        OrderInGroup: 1,
      });
      await attachQuestionToExam(manager, exam.ID, oldGroupedQuestion.ID, 1, {
        MediaQuestionID: mediaA.ID,
        IsGrouped: true,
      });

      await expect(
        service.replaceQuestionInExam(exam.ID, oldGroupedQuestion.ID, wrongMediaQuestion.ID, 5)
      ).rejects.toThrow('Cannot replace with question from different media group');
    });
  });

  describe('Hàm: getExamTypes() - Lấy danh sách loại đề thi', () => {
    it('TC-TRINH-EXM-037 — Trả về danh sách loại đề thi sắp xếp theo Code', async () => {
      const zzzType = await createExamTypeRecord(manager, { Code: 'ZZZ_TYPE' });
      const aaaType = await createExamTypeRecord(manager, { Code: 'AAA_TYPE' });

      const result = await service.getExamTypes();
      const aaaIndex = result.findIndex((item) => item.ID === aaaType.ID);
      const zzzIndex = result.findIndex((item) => item.ID === zzzType.ID);

      expect(aaaIndex).toBeGreaterThanOrEqual(0);
      expect(zzzIndex).toBeGreaterThanOrEqual(0);
      expect(aaaIndex).toBeLessThan(zzzIndex);
    });
  });

  describe('Hàm: createExamType() - Tạo loại đề thi', () => {
    it('TC-TRINH-EXM-038 — Không cho phép tạo loại đề thi trùng mã', async () => {
      const duplicateCode = uniqueValue('DUPLICATE_TYPE');
      await createExamTypeRecord(manager, {
        Code: duplicateCode,
        Description: 'De day du',
      });

      await expect(
        service.createExamType({ Code: duplicateCode, Description: 'De day du' } as any)
      ).rejects.toThrow('already exists');
    });
    it('TC-TRINH-EXM-039 — Tạo thành công loại đề thi mới khi mã chưa được sử dụng', async () => {
      const result = await service.createExamType({
        Code: 'MINI_TEST',
        Description: 'De mini test',
      } as any);

      expect(result.Code).toBe('MINI_TEST');
    });
  });

  describe('Hàm: updateExamType() - Cập nhật loại đề thi', () => {
    it('TC-TRINH-EXM-040 — Cập nhật thành công loại đề thi khi code mới không bị trùng', async () => {
      const examType = await createExamTypeRecord(manager, {
        Code: uniqueValue('OLD_TYPE'),
        Description: 'Old description',
      });

      const result = await service.updateExamType(examType.ID, {
        Code: uniqueValue('NEW_TYPE'),
        Description: 'New description',
      } as any);

      expect(result.Description).toBe('New description');
    });

    it('TC-TRINH-EXM-041 — Báo lỗi khi cập nhật sang Code đã tồn tại', async () => {
      const occupied = await createExamTypeRecord(manager, { Code: uniqueValue('USED_TYPE') });
      const target = await createExamTypeRecord(manager, { Code: uniqueValue('TARGET_TYPE') });

      await expect(
        service.updateExamType(target.ID, { Code: occupied.Code } as any)
      ).rejects.toThrow('already in use');
    });

    it('TC-TRINH-EXM-042 — Báo lỗi khi loại đề thi không tồn tại', async () => {
      await expect(service.updateExamType(999999, { Description: 'x' } as any)).rejects.toThrow(
        'Exam type not found'
      );
    });
  });

  describe('Hàm: deleteExamType() - Xóa loại đề thi', () => {
    it('TC-TRINH-EXM-043 — Không được xóa loại đề thi đang bị đề thi khác sử dụng', async () => {
      const examType = await createExamTypeRecord(manager, { Code: 'TYPE_IN_USE' });
      await createExamRecord(manager, 5, { ExamTypeID: examType.ID });

      await expect(service.deleteExamType(examType.ID)).rejects.toThrow(
        /Cannot delete exam type: 1 exam\(s\) are using it/
      );
    });

    it('TC-TRINH-EXM-044 — Cho phép xóa loại đề thi khi không còn đề thi nào tham chiếu đến nó', async () => {
      const examType = await createExamTypeRecord(manager, { Code: 'TYPE_UNUSED' });

      const result = await service.deleteExamType(examType.ID);
      const deleted = await manager.getRepository(ExamType).findOneBy({ ID: examType.ID });

      expect(result).toBe(true);
      expect(deleted).toBeNull();
    });
  });

  describe('Hàm: getNextOrderIndex() - Lấy thứ tự tiếp theo', () => {
    it('TC-TRINH-EXM-045 — Trả về OrderIndex tiếp theo đúng theo dữ liệu hiện có', async () => {
      const exam = await createExamRecord(manager, 5);
      const question1 = await createQuestionRecord(manager);
      const question2 = await createQuestionRecord(manager);
      await attachQuestionToExam(manager, exam.ID, question1.ID, 2);
      await attachQuestionToExam(manager, exam.ID, question2.ID, 5);

      const result = await service.getNextOrderIndex(exam.ID);

      expect(result).toBe(6);
    });
  });
});
