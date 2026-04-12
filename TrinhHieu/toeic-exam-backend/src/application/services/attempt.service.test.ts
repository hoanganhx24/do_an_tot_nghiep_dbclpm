import { AttemptService } from './attempt.service';
import { AttemptRepository } from '../../infrastructure/repositories/attempt.repository';
import { ExamRepository } from '../../infrastructure/repositories/exam.repository';

jest.mock('../../infrastructure/repositories/attempt.repository', () => ({
  AttemptRepository: jest.fn(),
}));

jest.mock('../../infrastructure/repositories/exam.repository', () => ({
  ExamRepository: jest.fn(),
}));

describe('AttemptService', () => {
  let service: AttemptService;
  let attemptRepositoryMock: any;
  let examRepositoryMock: any;

  const baseNow = new Date('2026-04-12T12:30:00.000Z');

  const makeAttemptBeforeSubmit = () => ({
    ID: 500,
    StudentProfileID: 20,
    StartedAt: new Date('2026-04-12T12:00:00.000Z'),
    SubmittedAt: null,
    exam: {
      ID: 900,
      Title: 'TOEIC Full Test Mock',
      TimeExam: 60,
    },
  });

  const makeGradedAttempt = () => ({
    ID: 500,
    StudentProfileID: 20,
    StartedAt: new Date('2026-04-12T12:00:00.000Z'),
    SubmittedAt: new Date('2026-04-12T12:30:00.000Z'),
    ScorePercent: 50,
    ScoreListening: 300,
    ScoreReading: 250,
    exam: {
      ID: 900,
      Title: 'TOEIC Full Test Mock',
      TimeExam: 60,
    },
    attemptAnswers: [
      {
        IsCorrect: false,
        choice: {
          ID: 10,
          Attribute: 'A',
          Content: 'Sai',
        },
        question: {
          ID: 1,
          QuestionText: 'Question listening',
          mediaQuestion: {
            Skill: 'LISTENING',
            Type: 'PHOTO_DESCRIPTION',
            Section: '1',
            AudioUrl: '/audio/q1.mp3',
            ImageUrl: '/img/q1.jpg',
            Scirpt: 'Transcript Q1',
          },
          choices: [
            {
              ID: 10,
              Attribute: 'A',
              Content: 'Sai',
              IsCorrect: false,
            },
            {
              ID: 11,
              Attribute: 'B',
              Content: 'Dung',
              IsCorrect: true,
            },
          ],
        },
      },
      {
        IsCorrect: true,
        choice: {
          ID: 20,
          Attribute: 'C',
          Content: 'Dung',
        },
        question: {
          ID: 2,
          QuestionText: 'Question reading',
          mediaQuestion: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
            AudioUrl: null,
            ImageUrl: null,
            Scirpt: 'Passage Q2',
          },
          choices: [
            {
              ID: 20,
              Attribute: 'C',
              Content: 'Dung',
              IsCorrect: true,
            },
            {
              ID: 21,
              Attribute: 'D',
              Content: 'Sai',
              IsCorrect: false,
            },
          ],
        },
      },
    ],
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(baseNow);

    attemptRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      submitAnswers: jest.fn(),
      findByStudentId: jest.fn(),
      getBestScore: jest.fn(),
      getProgressStats: jest.fn(),
      delete: jest.fn(),
    };

    examRepositoryMock = {
      findById: jest.fn(),
    };

    (AttemptRepository as unknown as jest.Mock).mockImplementation(
      () => attemptRepositoryMock
    );
    (ExamRepository as unknown as jest.Mock).mockImplementation(
      () => examRepositoryMock
    );

    service = new AttemptService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Test Case ID: TC-TRINH-ATT-001
  it('startAttempt should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.startAttempt({ ExamID: 1, Type: 'FULL_TEST' } as any, 20)
    ).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-ATT-002
  it('startAttempt should reject PRACTICE_BY_PART when Parts is empty', async () => {
    examRepositoryMock.findById.mockResolvedValue({ ID: 1 });

    await expect(
      service.startAttempt(
        { ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [] } as any,
        20
      )
    ).rejects.toThrow('Parts must be specified for practice by part mode');
  });

  // Test Case ID: TC-TRINH-ATT-003
  it('startAttempt should reject invalid part values outside 1-7', async () => {
    examRepositoryMock.findById.mockResolvedValue({ ID: 1 });

    await expect(
      service.startAttempt(
        { ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [0, 8] } as any,
        20
      )
    ).rejects.toThrow('Invalid part numbers: 0, 8');
  });

  // Test Case ID: TC-TRINH-ATT-004
  it('startAttempt should create attempt with null score fields for FULL_TEST', async () => {
    examRepositoryMock.findById.mockResolvedValue({ ID: 1, TimeExam: 120 });
    attemptRepositoryMock.create.mockResolvedValue({ ID: 99, ExamID: 1 });

    const result = await service.startAttempt(
      { ExamID: 1, Type: 'FULL_TEST' } as any,
      20
    );

    expect(attemptRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        StudentProfileID: 20,
        ExamID: 1,
        Type: 'FULL_TEST',
        ScorePercent: null,
        ScoreListening: null,
        ScoreReading: null,
        SubmittedAt: null,
      })
    );
    expect(result).toEqual({ ID: 99, ExamID: 1 });
  });

  // Test Case ID: TC-TRINH-ATT-005
  it('startAttempt should create attempt for PRACTICE_BY_PART when parts are valid', async () => {
    examRepositoryMock.findById.mockResolvedValue({ ID: 2, TimeExam: 45 });
    attemptRepositoryMock.create.mockResolvedValue({ ID: 1000, ExamID: 2 });

    const result = await service.startAttempt(
      { ExamID: 2, Type: 'PRACTICE_BY_PART', Parts: [1, 3, 5] } as any,
      20
    );

    expect(attemptRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(result.ID).toBe(1000);
  });

  // Test Case ID: TC-TRINH-ATT-006
  it('submitAttempt should throw when attempt does not exist', async () => {
    attemptRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.submitAttempt(
        { AttemptID: 1, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any,
        20
      )
    ).rejects.toThrow('Attempt not found');
  });

  // Test Case ID: TC-TRINH-ATT-007
  it('submitAttempt should reject when attempt belongs to another student', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ...makeAttemptBeforeSubmit(),
      StudentProfileID: 999,
    });

    await expect(
      service.submitAttempt(
        { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any,
        20
      )
    ).rejects.toThrow('You can only submit your own attempts');
  });

  // Test Case ID: TC-TRINH-ATT-008
  it('submitAttempt should reject already submitted attempt', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ...makeAttemptBeforeSubmit(),
      SubmittedAt: new Date('2026-04-12T12:10:00.000Z'),
    });

    await expect(
      service.submitAttempt(
        { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any,
        20
      )
    ).rejects.toThrow('This attempt has already been submitted');
  });

  // Test Case ID: TC-TRINH-ATT-009
  it('submitAttempt should reject when elapsed time exceeds limit + 1 minute', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ...makeAttemptBeforeSubmit(),
      StartedAt: new Date('2026-04-12T10:00:00.000Z'),
      exam: { Title: 'Late Exam', TimeExam: 60 },
    });

    await expect(
      service.submitAttempt(
        { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any,
        20
      )
    ).rejects.toThrow('Time limit exceeded. Limit: 60 minutes, Actual: 150 minutes');
  });

  // Test Case ID: TC-TRINH-ATT-010
  it('submitAttempt should throw when grading result is null', async () => {
    attemptRepositoryMock.findById.mockResolvedValue(makeAttemptBeforeSubmit());
    attemptRepositoryMock.submitAnswers.mockResolvedValue(null);

    await expect(
      service.submitAttempt(
        { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any,
        20
      )
    ).rejects.toThrow('Failed to grade attempt');
  });

  // Test Case ID: TC-TRINH-ATT-011
  it('submitAttempt should return detailed graded response with total score and analysis', async () => {
    const beforeSubmit = makeAttemptBeforeSubmit();
    const gradedAttempt = makeGradedAttempt();

    attemptRepositoryMock.findById.mockResolvedValue(beforeSubmit);
    attemptRepositoryMock.submitAnswers.mockResolvedValue(gradedAttempt);

    const result = await service.submitAttempt(
      {
        AttemptID: 500,
        answers: [
          { QuestionID: 1, ChoiceID: 10 },
          { QuestionID: 2, ChoiceID: 20 },
        ],
      } as any,
      20
    );

    expect(attemptRepositoryMock.submitAnswers).toHaveBeenCalledWith(500, [
      { QuestionID: 1, ChoiceID: 10 },
      { QuestionID: 2, ChoiceID: 20 },
    ]);
    expect(result.AttemptID).toBe(500);
    expect(result.ExamTitle).toBe('TOEIC Full Test Mock');
    expect(result.TimeTaken).toBe(30);
    expect(result.Scores.ScoreListening).toBe(300);
    expect(result.Scores.ScoreReading).toBe(250);
    expect(result.Scores.TotalScore).toBe(550);
    expect(result.Analysis.TotalQuestions).toBe(2);
    expect(result.Analysis.CorrectAnswers).toBe(1);
    expect(result.Analysis.ListeningCorrect).toBe(0);
    expect(result.Analysis.ReadingCorrect).toBe(1);
    expect(result.DetailedAnswers).toHaveLength(2);
    expect(result.DetailedAnswers[0].Media?.AudioUrl).toBe('/audio/q1.mp3');
  });

  // Test Case ID: TC-TRINH-ATT-012
  it('submitAttempt should identify weak area when accuracy by type is below 60%', async () => {
    attemptRepositoryMock.findById.mockResolvedValue(makeAttemptBeforeSubmit());
    attemptRepositoryMock.submitAnswers.mockResolvedValue(makeGradedAttempt());

    const result = await service.submitAttempt(
      {
        AttemptID: 500,
        answers: [
          { QuestionID: 1, ChoiceID: 10 },
          { QuestionID: 2, ChoiceID: 20 },
        ],
      } as any,
      20
    );

    expect(result.Analysis.WeakAreas).toEqual([
      'PHOTO_DESCRIPTION: 0/1 correct (0%)',
    ]);
  });

  // Test Case ID: TC-TRINH-ATT-013
  it('getAttemptResults should throw when attempt is not found', async () => {
    attemptRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getAttemptResults(88, 20)).rejects.toThrow('Attempt not found');
  });

  // Test Case ID: TC-TRINH-ATT-014
  it('getAttemptResults should reject access to another student attempt', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ...makeGradedAttempt(),
      StudentProfileID: 111,
    });

    await expect(service.getAttemptResults(88, 20)).rejects.toThrow(
      'You can only view your own attempt results'
    );
  });

  // Test Case ID: TC-TRINH-ATT-015
  it('getAttemptResults should reject when attempt has not been submitted', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ...makeAttemptBeforeSubmit(),
      SubmittedAt: null,
    });

    await expect(service.getAttemptResults(88, 20)).rejects.toThrow(
      'This attempt has not been submitted yet'
    );
  });

  // Test Case ID: TC-TRINH-ATT-016
  it('getAttemptResults should return result using StartedAt and SubmittedAt for time taken', async () => {
    const submitted = {
      ...makeGradedAttempt(),
      StartedAt: new Date('2026-04-12T11:00:00.000Z'),
      SubmittedAt: new Date('2026-04-12T11:45:00.000Z'),
    };
    attemptRepositoryMock.findById.mockResolvedValue(submitted);

    const result = await service.getAttemptResults(500, 20);

    expect(result.TimeTaken).toBe(45);
    expect(result.Scores.TotalScore).toBe(550);
  });

  // Test Case ID: TC-TRINH-ATT-017
  it('getStudentAttempts should pass through filters to repository', async () => {
    const attempts = [{ ID: 1 }, { ID: 2 }];
    const filters = {
      Type: 'FULL_TEST',
      StartDate: new Date('2026-01-01T00:00:00.000Z'),
      EndDate: new Date('2026-04-12T23:59:59.000Z'),
      SubmittedOnly: true,
    };
    attemptRepositoryMock.findByStudentId.mockResolvedValue(attempts);

    const result = await service.getStudentAttempts(20, filters);

    expect(attemptRepositoryMock.findByStudentId).toHaveBeenCalledWith(20, filters);
    expect(result).toEqual(attempts);
  });

  // Test Case ID: TC-TRINH-ATT-018
  it('getBestScore should delegate to repository with student and exam IDs', async () => {
    const best = { ID: 5, ScorePercent: 95 };
    attemptRepositoryMock.getBestScore.mockResolvedValue(best);

    const result = await service.getBestScore(20, 900);

    expect(attemptRepositoryMock.getBestScore).toHaveBeenCalledWith(20, 900);
    expect(result).toEqual(best);
  });

  // Test Case ID: TC-TRINH-ATT-019
  it('getProgressStatistics should delegate and return statistics object', async () => {
    const stats = {
      totalAttempts: 8,
      averageScore: 72,
      averageListening: 310,
      averageReading: 295,
      improvement: 6,
    };
    attemptRepositoryMock.getProgressStats.mockResolvedValue(stats);

    const result = await service.getProgressStatistics(20);

    expect(attemptRepositoryMock.getProgressStats).toHaveBeenCalledWith(20);
    expect(result).toEqual(stats);
  });

  // Test Case ID: TC-TRINH-ATT-020
  it('deleteAttempt should throw when attempt not found', async () => {
    attemptRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.deleteAttempt(500, 20)).rejects.toThrow('Attempt not found');
  });

  // Test Case ID: TC-TRINH-ATT-021
  it('deleteAttempt should reject deleting attempt from another student', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ID: 500,
      StudentProfileID: 999,
    });

    await expect(service.deleteAttempt(500, 20)).rejects.toThrow(
      'You can only delete your own attempts'
    );
  });

  // Test Case ID: TC-TRINH-ATT-022
  it('deleteAttempt should call repository delete and return true on success', async () => {
    attemptRepositoryMock.findById.mockResolvedValue({
      ID: 500,
      StudentProfileID: 20,
    });
    attemptRepositoryMock.delete.mockResolvedValue(true);

    const result = await service.deleteAttempt(500, 20);

    expect(attemptRepositoryMock.delete).toHaveBeenCalledWith(500);
    expect(result).toBe(true);
  });
});
