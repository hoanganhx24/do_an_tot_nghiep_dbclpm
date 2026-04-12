import { QuestionService } from './question.service';
import { QuestionRepository } from '../../infrastructure/repositories/question.repository';

jest.mock('../../infrastructure/repositories/question.repository', () => ({
  QuestionRepository: jest.fn(),
}));

describe('QuestionService', () => {
  let service: QuestionService;
  let questionRepositoryMock: any;

  const baseChoices = [
    { Attribute: 'A', Content: 'Option A', IsCorrect: true },
    { Attribute: 'B', Content: 'Option B', IsCorrect: false },
  ];

  const makeQuestion = (id = 1, overrides: any = {}) => ({
    ID: id,
    QuestionText: 'Question text',
    UserID: 10,
    MediaQuestionID: 100,
    mediaQuestion: {
      Skill: 'READING',
      Type: 'INCOMPLETE_SENTENCE',
      Section: '5',
      AudioUrl: null,
      ImageUrl: '/images/q.png',
      Scirpt: 'Script content',
    },
    choices: [
      { ID: 1, Attribute: 'A', Content: 'Option A', IsCorrect: true },
      { ID: 2, Attribute: 'B', Content: 'Option B', IsCorrect: false },
    ],
    ...overrides,
  });

  beforeEach(() => {
    questionRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findWithFilters: jest.fn(),
      getUsageStats: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getQuestionsBySection: jest.fn(),
      bulkDelete: jest.fn(),
    };

    (QuestionRepository as unknown as jest.Mock).mockImplementation(
      () => questionRepositoryMock
    );

    service = new QuestionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-TRINH-QST-001
  it('createQuestion should reject when number of choices is less than 2', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q1',
          Media: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
          },
          Choices: [{ Attribute: 'A', Content: 'One option', IsCorrect: true }],
        } as any,
        10
      )
    ).rejects.toThrow('Question must have at least 2 choices');
  });

  // Test Case ID: TC-TRINH-QST-002
  it('createQuestion should reject when no choice is marked correct', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q2',
          Media: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
          },
          Choices: [
            { Attribute: 'A', Content: 'A', IsCorrect: false },
            { Attribute: 'B', Content: 'B', IsCorrect: false },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Question must have exactly one correct answer');
  });

  // Test Case ID: TC-TRINH-QST-003
  it('createQuestion should reject when multiple choices are marked correct', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q3',
          Media: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
          },
          Choices: [
            { Attribute: 'A', Content: 'A', IsCorrect: true },
            { Attribute: 'B', Content: 'B', IsCorrect: true },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Question must have exactly one correct answer');
  });

  // Test Case ID: TC-TRINH-QST-004
  it('createQuestion should reject duplicate choice attributes', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q4',
          Media: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
          },
          Choices: [
            { Attribute: 'A', Content: 'A1', IsCorrect: true },
            { Attribute: 'A', Content: 'A2', IsCorrect: false },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Choice attributes must be unique');
  });

  // Test Case ID: TC-TRINH-QST-005
  it('createQuestion should reject empty choice content', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q5',
          Media: {
            Skill: 'READING',
            Type: 'INCOMPLETE_SENTENCE',
            Section: '5',
          },
          Choices: [
            { Attribute: 'A', Content: '  ', IsCorrect: true },
            { Attribute: 'B', Content: 'B', IsCorrect: false },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('All choices must have content');
  });

  // Test Case ID: TC-TRINH-QST-006
  it('createQuestion should reject listening question without audio URL', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q6',
          Media: {
            Skill: 'LISTENING',
            Type: 'PHOTO_DESCRIPTION',
            Section: '1',
            ImageUrl: '/images/p1.jpg',
          },
          Choices: baseChoices,
        } as any,
        10
      )
    ).rejects.toThrow('Listening questions must have audio URL');
  });

  // Test Case ID: TC-TRINH-QST-007
  it('createQuestion should reject part 1 question without image', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q7',
          Media: {
            Skill: 'READING',
            Type: 'PHOTO_DESCRIPTION',
            Section: '1',
          },
          Choices: baseChoices,
        } as any,
        10
      )
    ).rejects.toThrow('Part 1 questions must have an image');
  });

  // Test Case ID: TC-TRINH-QST-008
  it('createQuestion should reject invalid audio URL format', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q8',
          Media: {
            Skill: 'LISTENING',
            Type: 'SHORT_TALK',
            Section: '4',
            AudioUrl: 'invalid-audio-path',
          },
          Choices: baseChoices,
        } as any,
        10
      )
    ).rejects.toThrow('Invalid audio URL format');
  });

  // Test Case ID: TC-TRINH-QST-009
  it('createQuestion should reject invalid image URL format', async () => {
    await expect(
      service.createQuestion(
        {
          QuestionText: 'Q9',
          Media: {
            Skill: 'READING',
            Type: 'PHOTO_DESCRIPTION',
            Section: '1',
            ImageUrl: 'invalid-image-path',
          },
          Choices: baseChoices,
        } as any,
        10
      )
    ).rejects.toThrow('Invalid image URL format');
  });

  // Test Case ID: TC-TRINH-QST-010
  it('createQuestion should map data and call repository.create on valid input', async () => {
    const createdQuestion = makeQuestion(11);
    questionRepositoryMock.create.mockResolvedValue(createdQuestion);

    const result = await service.createQuestion(
      {
        QuestionText: 'Valid question',
        Media: {
          Skill: 'LISTENING',
          Type: 'SHORT_CONVERSATION',
          Section: '3',
          AudioUrl: '/uploads/audio/conversation.mp3',
          ImageUrl: '/uploads/images/img.png',
          Script: 'Conversation script',
        },
        Choices: [
          { Attribute: 'A', Content: 'Ans A', IsCorrect: true },
          { Attribute: 'B', Content: 'Ans B', IsCorrect: false },
        ],
      } as any,
      77
    );

    expect(questionRepositoryMock.create).toHaveBeenCalledWith(
      {
        QuestionText: 'Valid question',
        UserID: 77,
      },
      {
        Skill: 'LISTENING',
        Type: 'SHORT_CONVERSATION',
        Section: '3',
        AudioUrl: '/uploads/audio/conversation.mp3',
        ImageUrl: '/uploads/images/img.png',
        Scirpt: 'Conversation script',
      },
      [
        { Content: 'Ans A', Attribute: 'A', IsCorrect: true },
        { Content: 'Ans B', Attribute: 'B', IsCorrect: false },
      ]
    );
    expect(result.ID).toBe(11);
  });

  // Test Case ID: TC-TRINH-QST-011
  it('getQuestionById should throw when question is not found', async () => {
    questionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getQuestionById(999)).rejects.toThrow('Question not found');
  });

  // Test Case ID: TC-TRINH-QST-012
  it('getQuestionById should return question when found', async () => {
    const question = makeQuestion(12);
    questionRepositoryMock.findById.mockResolvedValue(question);

    const result = await service.getQuestionById(12);

    expect(result.ID).toBe(12);
  });

  // Test Case ID: TC-TRINH-QST-013
  it('searchQuestions should forward filters and transform to paginated response', async () => {
    const q1 = makeQuestion(1, { UserID: 91 });
    const q2 = makeQuestion(2, { UserID: 92, QuestionText: null });

    questionRepositoryMock.findWithFilters.mockResolvedValue({
      questions: [q1, q2],
      total: 12,
    });
    questionRepositoryMock.getUsageStats
      .mockResolvedValueOnce({ usedInExams: 3 })
      .mockResolvedValueOnce({ usedInExams: 0 });

    const result = await service.searchQuestions({
      Skill: 'READING',
      Section: '5',
      Type: 'INCOMPLETE_SENTENCE',
      SearchText: 'sentence',
      Page: 2,
      Limit: 5,
    } as any);

    expect(questionRepositoryMock.findWithFilters).toHaveBeenCalledWith({
      Skill: 'READING',
      Section: '5',
      Type: 'INCOMPLETE_SENTENCE',
      SearchText: 'sentence',
      Page: 2,
      Limit: 5,
    });
    expect(result.Questions).toHaveLength(2);
    expect(result.Questions[0].UsageCount).toBe(3);
    expect(result.Questions[1].QuestionText).toBe('');
    expect(result.Pagination.CurrentPage).toBe(2);
    expect(result.Pagination.TotalPages).toBe(3);
    expect(result.Pagination.TotalQuestions).toBe(12);
  });

  // Test Case ID: TC-TRINH-QST-014
  it('searchQuestions should apply default page=1 and limit=20 when omitted', async () => {
    questionRepositoryMock.findWithFilters.mockResolvedValue({
      questions: [makeQuestion(3)],
      total: 1,
    });
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 1 });

    const result = await service.searchQuestions({} as any);

    expect(result.Pagination.CurrentPage).toBe(1);
    expect(result.Pagination.Limit).toBe(20);
    expect(result.Pagination.TotalPages).toBe(1);
  });

  // Test Case ID: TC-TRINH-QST-015
  it('updateQuestion should throw when question does not exist', async () => {
    questionRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.updateQuestion(1, { QuestionText: 'New' } as any, 99)
    ).rejects.toThrow('Question not found');
  });

  // Test Case ID: TC-TRINH-QST-016
  it('updateQuestion should log warning when question is widely used and still proceed', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(16));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 6 });
    questionRepositoryMock.update.mockResolvedValue(makeQuestion(16, { QuestionText: 'Updated' }));

    const result = await service.updateQuestion(
      16,
      { QuestionText: 'Updated' } as any,
      99
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Warning: Updating question 16 which is used in 6 exams'
    );
    expect(result.QuestionText).toBe('Updated');
    warnSpy.mockRestore();
  });

  // Test Case ID: TC-TRINH-QST-017
  it('updateQuestion should validate updated choices and reject invalid payload', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(17));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });

    await expect(
      service.updateQuestion(
        17,
        {
          Choices: [{ Attribute: 'A', Content: 'Only one', IsCorrect: true }],
        } as any,
        99
      )
    ).rejects.toThrow('Question must have at least 2 choices');
  });

  // Test Case ID: TC-TRINH-QST-018
  it('updateQuestion should validate updated media and reject listening without audio', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(18));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });

    await expect(
      service.updateQuestion(
        18,
        {
          Media: {
            Skill: 'LISTENING',
            Type: 'SHORT_TALK',
            Section: '4',
          },
        } as any,
        99
      )
    ).rejects.toThrow('Listening questions must have audio URL');
  });

  // Test Case ID: TC-TRINH-QST-019
  it('updateQuestion should throw when repository update returns null', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(19));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });
    questionRepositoryMock.update.mockResolvedValue(null);

    await expect(
      service.updateQuestion(
        19,
        { QuestionText: 'Will fail update' } as any,
        99
      )
    ).rejects.toThrow('Failed to update question');
  });

  // Test Case ID: TC-TRINH-QST-020
  it('updateQuestion should map fields and return updated question on success', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(20));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 1 });
    questionRepositoryMock.update.mockResolvedValue(
      makeQuestion(20, { QuestionText: 'Updated text' })
    );

    const result = await service.updateQuestion(
      20,
      {
        QuestionText: 'Updated text',
        Media: {
          Skill: 'READING',
          Type: 'READING_COMPREHENSION',
          Section: '7',
          AudioUrl: '/audio/new.mp3',
          ImageUrl: '/img/new.png',
          Script: 'Updated script',
        },
        Choices: [
          { Attribute: 'A', Content: 'New A', IsCorrect: false },
          { Attribute: 'B', Content: 'New B', IsCorrect: true },
        ],
      } as any,
      99
    );

    expect(questionRepositoryMock.update).toHaveBeenCalledWith(
      20,
      { QuestionText: 'Updated text' },
      {
        Skill: 'READING',
        Type: 'READING_COMPREHENSION',
        Section: '7',
        AudioUrl: '/audio/new.mp3',
        ImageUrl: '/img/new.png',
        Scirpt: 'Updated script',
      },
      [
        { Content: 'New A', Attribute: 'A', IsCorrect: false },
        { Content: 'New B', Attribute: 'B', IsCorrect: true },
      ]
    );
    expect(result.QuestionText).toBe('Updated text');
  });

  // Test Case ID: TC-TRINH-QST-021
  it('deleteQuestion should throw when question does not exist', async () => {
    questionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.deleteQuestion(21, 99)).rejects.toThrow('Question not found');
  });

  // Test Case ID: TC-TRINH-QST-022
  it('deleteQuestion should reject when question is used in exams', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(22));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 2 });

    await expect(service.deleteQuestion(22, 99)).rejects.toThrow(
      'Cannot delete question that is used in 2 exam(s). Remove it from all exams first.'
    );
  });

  // Test Case ID: TC-TRINH-QST-023
  it('deleteQuestion should call repository.delete and return result when no usage', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(23));
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });
    questionRepositoryMock.delete.mockResolvedValue(true);

    const result = await service.deleteQuestion(23, 99);

    expect(questionRepositoryMock.delete).toHaveBeenCalledWith(23);
    expect(result).toBe(true);
  });

  // Test Case ID: TC-TRINH-QST-024
  it('getQuestionStatistics should throw when question does not exist', async () => {
    questionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getQuestionStatistics(24)).rejects.toThrow('Question not found');
  });

  // Test Case ID: TC-TRINH-QST-025
  it('getQuestionStatistics should return repository usage statistics', async () => {
    questionRepositoryMock.findById.mockResolvedValue(makeQuestion(25));
    questionRepositoryMock.getUsageStats.mockResolvedValue({
      questionId: 25,
      usedInExams: 4,
      totalAttempts: 50,
      correctPercentage: 64,
    });

    const stats = await service.getQuestionStatistics(25);

    expect(stats.usedInExams).toBe(4);
    expect(stats.correctPercentage).toBe(64);
  });

  // Test Case ID: TC-TRINH-QST-026
  it('getQuestionsBySection should throw when section array is empty', async () => {
    await expect(service.getQuestionsBySection([], 10)).rejects.toThrow(
      'At least one section must be specified'
    );
  });

  // Test Case ID: TC-TRINH-QST-027
  it('getQuestionsBySection should forward sections and limit to repository', async () => {
    questionRepositoryMock.getQuestionsBySection.mockResolvedValue([
      makeQuestion(27),
      makeQuestion(28),
    ]);

    const result = await service.getQuestionsBySection(['5', '6'], 15);

    expect(questionRepositoryMock.getQuestionsBySection).toHaveBeenCalledWith(
      ['5', '6'],
      15
    );
    expect(result).toHaveLength(2);
  });

  // Test Case ID: TC-TRINH-QST-028
  it('performBulkOperation DELETE should return success count when repository succeeds', async () => {
    questionRepositoryMock.bulkDelete.mockResolvedValue(3);

    const result = await service.performBulkOperation(
      {
        Operation: 'DELETE',
        QuestionIDs: [1, 2, 3],
      } as any,
      99
    );

    expect(result.success).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
  });

  // Test Case ID: TC-TRINH-QST-029
  it('performBulkOperation DELETE should report errors when repository throws', async () => {
    questionRepositoryMock.bulkDelete.mockRejectedValue(new Error('DB fail'));

    const result = await service.performBulkOperation(
      {
        Operation: 'DELETE',
        QuestionIDs: [1, 2, 3],
      } as any,
      99
    );

    expect(result.success).toBe(0);
    expect(result.failed).toBe(3);
    expect(result.errors[0]).toBe('Bulk delete failed: DB fail');
  });

  // Test Case ID: TC-TRINH-QST-030
  it('performBulkOperation ADD_TO_EXAM should return not-implemented message', async () => {
    const result = await service.performBulkOperation(
      {
        Operation: 'ADD_TO_EXAM',
        QuestionIDs: [5, 6],
        TargetExamID: 100,
      } as any,
      99
    );

    expect(result.success).toBe(0);
    expect(result.failed).toBe(2);
    expect(result.errors[0]).toBe('ADD_TO_EXAM operation should be handled by ExamService');
  });

  // Test Case ID: TC-TRINH-QST-031
  it('performBulkOperation should return error for unknown operation', async () => {
    const result = await service.performBulkOperation(
      {
        Operation: 'ARCHIVE',
        QuestionIDs: [1],
      } as any,
      99
    );

    expect(result.success).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toBe('Unknown operation: ARCHIVE');
  });
});
