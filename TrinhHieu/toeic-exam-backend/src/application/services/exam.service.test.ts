import { ExamService } from './exam.service';
import { ExamRepository } from '../../infrastructure/repositories/exam.repository';
import { QuestionRepository } from '../../infrastructure/repositories/question.repository';
import { MediaQuestionRepository } from '../../infrastructure/repositories/media-question.repository';

jest.mock('../../infrastructure/repositories/exam.repository', () => ({
  ExamRepository: jest.fn(),
}));

jest.mock('../../infrastructure/repositories/question.repository', () => ({
  QuestionRepository: jest.fn(),
}));

jest.mock('../../infrastructure/repositories/media-question.repository', () => ({
  MediaQuestionRepository: jest.fn(),
}));

describe('ExamService', () => {
  let service: ExamService;
  let examRepositoryMock: any;
  let questionRepositoryMock: any;
  let mediaQuestionRepositoryMock: any;

  const makeBaseExam = (overrides: any = {}) => ({
    ID: 1,
    Title: 'Mock Exam',
    TimeExam: 120,
    Type: 'FULL_TEST',
    ExamTypeID: 2,
    UserID: 10,
    examType: {
      ID: 2,
      Code: 'FULL',
      Description: 'Full TOEIC test',
    },
    attempts: [],
    examQuestions: [],
    ...overrides,
  });

  const makeExamQuestion = (
    id: number,
    questionId: number,
    orderIndex: number,
    mediaQuestionId: number | null,
    isGrouped = false
  ) => ({
    ID: id,
    QuestionID: questionId,
    OrderIndex: orderIndex,
    MediaQuestionID: mediaQuestionId,
    IsGrouped: isGrouped,
    question: {
      ID: questionId,
      QuestionText: `Question ${questionId}`,
      OrderInGroup: 1,
      mediaQuestion: {
        ID: mediaQuestionId || 999,
        Skill: 'READING',
        Type: 'INCOMPLETE_SENTENCE',
        Section: '5',
        AudioUrl: null,
        ImageUrl: null,
        Scirpt: 'Script',
      },
      choices: [
        { ID: 1, Attribute: 'A', Content: 'A content', IsCorrect: true },
        { ID: 2, Attribute: 'B', Content: 'B content', IsCorrect: false },
      ],
    },
  });

  beforeEach(() => {
    examRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addQuestions: jest.fn(),
      removeQuestions: jest.fn(),
      getEnhancedStatistics: jest.fn(),
      searchByTitle: jest.fn(),
      addQuestionsWithMediaTracking: jest.fn(),
      containsMediaGroup: jest.fn(),
      removeMediaGroup: jest.fn(),
      getOrganizedContent: jest.fn(),
      moveMediaGroup: jest.fn(),
      validateExamStructure: jest.fn(),
      reorderQuestions: jest.fn(),
      updateExamQuestion: jest.fn(),
      findAllExamTypes: jest.fn(),
      findExamTypeByCode: jest.fn(),
      createExamType: jest.fn(),
      findExamTypeById: jest.fn(),
      updateExamType: jest.fn(),
      countExamsByType: jest.fn(),
      deleteExamType: jest.fn(),
      getNextOrderIndex: jest.fn(),
    };

    questionRepositoryMock = {
      findByIds: jest.fn(),
      findByMediaIds: jest.fn(),
      findByMediaQuestionId: jest.fn(),
      findById: jest.fn(),
    };

    mediaQuestionRepositoryMock = {
      findById: jest.fn(),
    };

    (ExamRepository as unknown as jest.Mock).mockImplementation(
      () => examRepositoryMock
    );
    (QuestionRepository as unknown as jest.Mock).mockImplementation(
      () => questionRepositoryMock
    );
    (MediaQuestionRepository as unknown as jest.Mock).mockImplementation(
      () => mediaQuestionRepositoryMock
    );

    service = new ExamService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-TRINH-EXM-001
  it('createExam should reject empty title', async () => {
    await expect(
      service.createExam(
        {
          Title: ' ',
          TimeExam: 120,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
        } as any,
        10
      )
    ).rejects.toThrow('Exam title cannot be empty');
  });

  // Test Case ID: TC-TRINH-EXM-002
  it('createExam should reject time lower than 1 minute', async () => {
    await expect(
      service.createExam(
        {
          Title: 'Exam A',
          TimeExam: 0,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
        } as any,
        10
      )
    ).rejects.toThrow('Exam time must be between 1 and 240 minutes');
  });

  // Test Case ID: TC-TRINH-EXM-003
  it('createExam should reject time over 240 minutes', async () => {
    await expect(
      service.createExam(
        {
          Title: 'Exam A',
          TimeExam: 241,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
        } as any,
        10
      )
    ).rejects.toThrow('Exam time must be between 1 and 240 minutes');
  });

  // Test Case ID: TC-TRINH-EXM-004
  it('createExam should reject when explicit question IDs are missing in repository', async () => {
    examRepositoryMock.create.mockResolvedValue({ ID: 100 });
    questionRepositoryMock.findByIds.mockResolvedValue([{ ID: 1 }]);

    await expect(
      service.createExam(
        {
          Title: 'Exam B',
          TimeExam: 90,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
          questions: [
            { QuestionID: 1, OrderIndex: 1 },
            { QuestionID: 2, OrderIndex: 2 },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Some questions do not exist');
  });

  // Test Case ID: TC-TRINH-EXM-005
  it('createExam should reject when MediaQuestionIDs provided but no media questions found', async () => {
    examRepositoryMock.create.mockResolvedValue({ ID: 101 });
    questionRepositoryMock.findByMediaIds.mockResolvedValue([]);

    await expect(
      service.createExam(
        {
          Title: 'Exam C',
          TimeExam: 60,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
          MediaQuestionIDs: [50],
        } as any,
        10
      )
    ).rejects.toThrow('No questions found for selected media blocks');
  });

  // Test Case ID: TC-TRINH-EXM-006
  it('createExam should merge explicit questions and media-derived questions with deduplication', async () => {
    const created = { ID: 102 };
    const completed = makeBaseExam({ ID: 102 });

    examRepositoryMock.create.mockResolvedValue(created);
    questionRepositoryMock.findByIds.mockResolvedValue([{ ID: 1 }]);
    questionRepositoryMock.findByMediaIds.mockResolvedValue([
      { ID: 1, MediaQuestionID: 50 },
      { ID: 2, MediaQuestionID: 50 },
    ]);
    examRepositoryMock.addQuestions.mockResolvedValue([]);
    examRepositoryMock.findById.mockResolvedValue(completed);

    const result = await service.createExam(
      {
        Title: 'Exam Merge',
        TimeExam: 75,
        Type: 'FULL_TEST',
        ExamTypeID: 2,
        questions: [{ QuestionID: 1, OrderIndex: 5 }],
        MediaQuestionIDs: [50],
      } as any,
      10
    );

    expect(examRepositoryMock.addQuestions).toHaveBeenCalledWith(102, [
      { QuestionID: 1, OrderIndex: 5 },
      {
        QuestionID: 2,
        OrderIndex: 7,
        MediaQuestionID: 50,
        IsGrouped: true,
      },
    ]);
    expect(result.ID).toBe(102);
  });

  // Test Case ID: TC-TRINH-EXM-007
  it('createExam should throw when created exam cannot be reloaded', async () => {
    examRepositoryMock.create.mockResolvedValue({ ID: 103 });
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.createExam(
        {
          Title: 'Exam Reload Fail',
          TimeExam: 80,
          Type: 'FULL_TEST',
          ExamTypeID: 2,
        } as any,
        10
      )
    ).rejects.toThrow('Failed to retrieve created exam');
  });

  // Test Case ID: TC-TRINH-EXM-008
  it('getExamById should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getExamById(999)).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-EXM-009
  it('getExamById should transform entity to response and hide IsCorrect', async () => {
    const exam = makeBaseExam({
      examQuestions: [
        makeExamQuestion(1, 10, 1, 500, false),
      ],
    });
    examRepositoryMock.findById.mockResolvedValue(exam);

    const result = await service.getExamById(1);

    expect(result.ID).toBe(1);
    expect(result.ExamType.Code).toBe('FULL');
    expect(result.Questions[0].Choices[0]).not.toHaveProperty('IsCorrect');
  });

  // Test Case ID: TC-TRINH-EXM-010
  it('getAllExams should forward filter criteria to repository', async () => {
    examRepositoryMock.findAll.mockResolvedValue([{ ID: 1 }, { ID: 2 }]);

    const result = await service.getAllExams({ ExamTypeID: 2, Type: 'FULL_TEST' });

    expect(examRepositoryMock.findAll).toHaveBeenCalledWith({
      ExamTypeID: 2,
      Type: 'FULL_TEST',
    });
    expect(result).toHaveLength(2);
  });

  // Test Case ID: TC-TRINH-EXM-011
  it('updateExam should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.updateExam(1, { Title: 'New' } as any, 10)).rejects.toThrow(
      'Exam not found'
    );
  });

  // Test Case ID: TC-TRINH-EXM-012
  it('updateExam should throw when user does not own exam', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam({ UserID: 99 }));

    await expect(service.updateExam(1, { Title: 'New' } as any, 10)).rejects.toThrow(
      'You do not have permission to update this exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-013
  it('updateExam should validate TimeExam in range 1..240', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());

    await expect(service.updateExam(1, { TimeExam: 500 } as any, 10)).rejects.toThrow(
      'Exam time must be between 1 and 240 minutes'
    );
  });

  // Test Case ID: TC-TRINH-EXM-014
  it('updateExam should throw when repository returns null after update', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.update.mockResolvedValue(null);

    await expect(service.updateExam(1, { Title: 'Updated' } as any, 10)).rejects.toThrow(
      'Failed to update exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-015
  it('updateExam should return updated exam on success', async () => {
    const updated = makeBaseExam({ Title: 'Updated title' });
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.update.mockResolvedValue(updated);

    const result = await service.updateExam(1, { Title: 'Updated title' } as any, 10);

    expect(result.Title).toBe('Updated title');
  });

  // Test Case ID: TC-TRINH-EXM-016
  it('deleteExam should throw when exam not found', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.deleteExam(1, 10)).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-EXM-017
  it('deleteExam should throw when user has no permission', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam({ UserID: 90 }));

    await expect(service.deleteExam(1, 10)).rejects.toThrow(
      'You do not have permission to delete this exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-018
  it('deleteExam should block deletion when exam has attempts', async () => {
    examRepositoryMock.findById.mockResolvedValue(
      makeBaseExam({ attempts: [{ ID: 1 }] })
    );

    await expect(service.deleteExam(1, 10)).rejects.toThrow(
      'Cannot delete exam that has been taken by students. Consider archiving instead.'
    );
  });

  // Test Case ID: TC-TRINH-EXM-019
  it('deleteExam should call repository delete and return true', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.delete.mockResolvedValue(true);

    const result = await service.deleteExam(1, 10);

    expect(examRepositoryMock.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  // Test Case ID: TC-TRINH-EXM-020
  it('addQuestionsToExam should reject duplicate question already present in exam', async () => {
    examRepositoryMock.findById.mockResolvedValue(
      makeBaseExam({ examQuestions: [{ QuestionID: 10 }] })
    );
    questionRepositoryMock.findByIds.mockResolvedValue([{ ID: 10 }]);

    await expect(
      service.addQuestionsToExam(1, [{ QuestionID: 10, OrderIndex: 1 }], 10)
    ).rejects.toThrow('Questions 10 are already in this exam');
  });

  // Test Case ID: TC-TRINH-EXM-021
  it('addQuestionsToExam should add questions and return updated exam', async () => {
    examRepositoryMock.findById
      .mockResolvedValueOnce(makeBaseExam({ examQuestions: [] }))
      .mockResolvedValueOnce(makeBaseExam({ examQuestions: [{ QuestionID: 11 }] }));
    questionRepositoryMock.findByIds.mockResolvedValue([{ ID: 11 }]);
    examRepositoryMock.addQuestions.mockResolvedValue([]);

    const result = await service.addQuestionsToExam(
      1,
      [{ QuestionID: 11, OrderIndex: 2 }],
      10
    );

    expect(examRepositoryMock.addQuestions).toHaveBeenCalledWith(1, [
      { QuestionID: 11, OrderIndex: 2 },
    ]);
    expect(result.ID).toBe(1);
  });

  // Test Case ID: TC-TRINH-EXM-022
  it('removeQuestionsFromExam should throw when user has no permission', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam({ UserID: 77 }));

    await expect(service.removeQuestionsFromExam(1, [11], 10)).rejects.toThrow(
      'You do not have permission to modify this exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-023
  it('removeQuestionsFromExam should return number of removed questions', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.removeQuestions.mockResolvedValue(2);

    const removed = await service.removeQuestionsFromExam(1, [11, 12], 10);

    expect(removed).toBe(2);
  });

  // Test Case ID: TC-TRINH-EXM-024
  it('getExamStatistics should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getExamStatistics(1)).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-EXM-025
  it('searchExams should reject empty search term', async () => {
    await expect(service.searchExams('   ')).rejects.toThrow('Search term cannot be empty');
  });

  // Test Case ID: TC-TRINH-EXM-026
  it('duplicateExam should clone with media tracking when source has examQuestions', async () => {
    const original = makeBaseExam({
      ID: 10,
      Title: 'Original',
      examQuestions: [
        { QuestionID: 1, OrderIndex: 1, MediaQuestionID: 50, IsGrouped: true },
        { QuestionID: 2, OrderIndex: 2, MediaQuestionID: null, IsGrouped: false },
      ],
    });
    const duplicatedExam = makeBaseExam({ ID: 20, Title: 'Original - Copy' });

    examRepositoryMock.findById
      .mockResolvedValueOnce(original)
      .mockResolvedValueOnce(duplicatedExam);
    examRepositoryMock.create.mockResolvedValue({ ID: 20 });
    examRepositoryMock.addQuestionsWithMediaTracking.mockResolvedValue([]);

    const result = await service.duplicateExam(10, 99);

    expect(examRepositoryMock.addQuestionsWithMediaTracking).toHaveBeenCalledWith(20, [
      { QuestionID: 1, OrderIndex: 1, MediaQuestionID: 50, IsGrouped: true },
      { QuestionID: 2, OrderIndex: 2, MediaQuestionID: null, IsGrouped: false },
    ]);
    expect(result.ID).toBe(20);
  });

  // Test Case ID: TC-TRINH-EXM-027
  it('addMediaGroupToExam should throw when media group already exists in exam', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    mediaQuestionRepositoryMock.findById.mockResolvedValue({ ID: 50 });
    examRepositoryMock.containsMediaGroup.mockResolvedValue(true);

    await expect(service.addMediaGroupToExam(1, 50, 10, 10)).rejects.toThrow(
      'This media group is already in the exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-028
  it('addMediaGroupToExam should throw when media group has no questions', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    mediaQuestionRepositoryMock.findById.mockResolvedValue({ ID: 50, GroupTitle: 'Part 7' });
    examRepositoryMock.containsMediaGroup.mockResolvedValue(false);
    questionRepositoryMock.findByMediaQuestionId.mockResolvedValue([]);

    await expect(service.addMediaGroupToExam(1, 50, 10, 10)).rejects.toThrow(
      'Media group has no questions'
    );
  });

  // Test Case ID: TC-TRINH-EXM-029
  it('addMediaGroupToExam should add all media questions with sequential order', async () => {
    examRepositoryMock.findById
      .mockResolvedValueOnce(makeBaseExam())
      .mockResolvedValueOnce(makeBaseExam({ ID: 1 }));
    mediaQuestionRepositoryMock.findById.mockResolvedValue({ ID: 50, GroupTitle: 'Part 7 Group' });
    examRepositoryMock.containsMediaGroup.mockResolvedValue(false);
    questionRepositoryMock.findByMediaQuestionId.mockResolvedValue([
      { ID: 101 },
      { ID: 102 },
    ]);
    examRepositoryMock.addQuestionsWithMediaTracking.mockResolvedValue([]);

    const result = await service.addMediaGroupToExam(1, 50, 10, 10);

    expect(examRepositoryMock.addQuestionsWithMediaTracking).toHaveBeenCalledWith(1, [
      { QuestionID: 101, OrderIndex: 10, MediaQuestionID: 50, IsGrouped: true },
      { QuestionID: 102, OrderIndex: 11, MediaQuestionID: 50, IsGrouped: true },
    ]);
    expect(result.questionsAdded).toBe(2);
    expect(result.startOrderIndex).toBe(10);
    expect(result.endOrderIndex).toBe(11);
  });

  // Test Case ID: TC-TRINH-EXM-030
  it('removeMediaGroupFromExam should throw when group not found in exam', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.containsMediaGroup.mockResolvedValue(false);

    await expect(service.removeMediaGroupFromExam(1, 50, 10)).rejects.toThrow(
      'Media group not found in this exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-031
  it('removeMediaGroupFromExam should remove all question links in that group', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.containsMediaGroup.mockResolvedValue(true);
    examRepositoryMock.removeMediaGroup.mockResolvedValue(3);

    const removed = await service.removeMediaGroupFromExam(1, 50, 10);

    expect(removed).toBe(3);
  });

  // Test Case ID: TC-TRINH-EXM-032
  it('getExamContentOrganized should throw when a grouped media cannot be loaded', async () => {
    const groupedEq = makeExamQuestion(1, 11, 1, 50, true);
    examRepositoryMock.getOrganizedContent.mockResolvedValue({
      mediaGroups: new Map([[50, [groupedEq]]]),
      standaloneQuestions: [],
    });
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getExamContentOrganized(1)).rejects.toThrow(
      'Media question 50 not found'
    );
  });

  // Test Case ID: TC-TRINH-EXM-033
  it('getExamContentOrganized should sort grouped and standalone questions by order', async () => {
    const groupedEqA = makeExamQuestion(1, 11, 3, 50, true);
    const groupedEqB = makeExamQuestion(2, 12, 2, 50, true);
    const standaloneEq = makeExamQuestion(3, 13, 5, null, false);

    examRepositoryMock.getOrganizedContent.mockResolvedValue({
      mediaGroups: new Map([[50, [groupedEqA, groupedEqB]]]),
      standaloneQuestions: [standaloneEq],
    });
    mediaQuestionRepositoryMock.findById.mockResolvedValue({
      ID: 50,
      GroupTitle: 'Part 7 block',
      Skill: 'READING',
      Type: 'READING_COMPREHENSION',
      Section: '7',
      AudioUrl: null,
      ImageUrl: '/img/doc.png',
      Scirpt: 'Passage text',
    });

    const result = await service.getExamContentOrganized(1);

    expect(result.mediaGroups[0].questions[0].orderIndex).toBe(2);
    expect(result.mediaGroups[0].questions[1].orderIndex).toBe(3);
    expect(result.standaloneQuestions[0].orderIndex).toBe(5);
  });

  // Test Case ID: TC-TRINH-EXM-034
  it('compactExamOrder should reorder by existing OrderIndex into 1..N sequence', async () => {
    examRepositoryMock.findById.mockResolvedValue(
      makeBaseExam({
        examQuestions: [
          { ID: 100, OrderIndex: 5 },
          { ID: 101, OrderIndex: 2 },
          { ID: 102, OrderIndex: 3 },
        ],
      })
    );
    examRepositoryMock.reorderQuestions.mockResolvedValue(3);

    const changed = await service.compactExamOrder(1, 10);

    expect(examRepositoryMock.reorderQuestions).toHaveBeenCalledWith([
      { examQuestionId: 101, newOrderIndex: 1 },
      { examQuestionId: 102, newOrderIndex: 2 },
      { examQuestionId: 100, newOrderIndex: 3 },
    ]);
    expect(changed).toBe(3);
  });

  // Test Case ID: TC-TRINH-EXM-035
  it('replaceQuestionInExam should block replacement with question from different media group', async () => {
    examRepositoryMock.findById.mockResolvedValue(
      makeBaseExam({
        examQuestions: [
          {
            ID: 9,
            QuestionID: 10,
            IsGrouped: true,
            MediaQuestionID: 50,
          },
        ],
      })
    );
    questionRepositoryMock.findById.mockResolvedValue({ ID: 20, MediaQuestionID: 99 });

    await expect(service.replaceQuestionInExam(1, 10, 20, 10)).rejects.toThrow(
      'Cannot replace with question from different media group'
    );
  });

  // Test Case ID: TC-TRINH-EXM-036
  it('replaceQuestionInExam should update QuestionID and return true on success', async () => {
    examRepositoryMock.findById.mockResolvedValue(
      makeBaseExam({
        examQuestions: [
          {
            ID: 9,
            QuestionID: 10,
            IsGrouped: false,
            MediaQuestionID: null,
          },
        ],
      })
    );
    questionRepositoryMock.findById.mockResolvedValue({ ID: 20, MediaQuestionID: 77 });
    examRepositoryMock.updateExamQuestion.mockResolvedValue({ ID: 9, QuestionID: 20 });

    const ok = await service.replaceQuestionInExam(1, 10, 20, 10);

    expect(examRepositoryMock.updateExamQuestion).toHaveBeenCalledWith(9, {
      QuestionID: 20,
    });
    expect(ok).toBe(true);
  });

  // Test Case ID: TC-TRINH-EXM-037
  it('createExamType should reject duplicate code', async () => {
    examRepositoryMock.findExamTypeByCode.mockResolvedValue({ ID: 1, Code: 'FULL' });

    await expect(
      service.createExamType({ Code: 'FULL', Description: 'Duplicate' } as any)
    ).rejects.toThrow('Exam type with code "FULL" already exists');
  });

  // Test Case ID: TC-TRINH-EXM-038
  it('createExamType should create new exam type when code is unique', async () => {
    examRepositoryMock.findExamTypeByCode.mockResolvedValue(null);
    examRepositoryMock.createExamType.mockResolvedValue({ ID: 10, Code: 'MINI' });

    const created = await service.createExamType({ Code: 'MINI' } as any);

    expect(created.Code).toBe('MINI');
  });

  // Test Case ID: TC-TRINH-EXM-039
  it('updateExamType should reject duplicate code used by another record', async () => {
    examRepositoryMock.findExamTypeById.mockResolvedValue({ ID: 5, Code: 'OLD' });
    examRepositoryMock.findExamTypeByCode.mockResolvedValue({ ID: 6, Code: 'NEW' });

    await expect(service.updateExamType(5, { Code: 'NEW' } as any)).rejects.toThrow(
      'Exam type code "NEW" is already in use'
    );
  });

  // Test Case ID: TC-TRINH-EXM-040
  it('updateExamType should update and return exam type when valid', async () => {
    examRepositoryMock.findExamTypeById.mockResolvedValue({ ID: 5, Code: 'OLD' });
    examRepositoryMock.updateExamType.mockResolvedValue({
      ID: 5,
      Code: 'OLD',
      Description: 'Updated desc',
    });

    const updated = await service.updateExamType(5, { Description: 'Updated desc' } as any);

    expect(updated.Description).toBe('Updated desc');
  });

  // Test Case ID: TC-TRINH-EXM-041
  it('deleteExamType should block deletion when at least one exam is using this type', async () => {
    examRepositoryMock.countExamsByType.mockResolvedValue(3);

    await expect(service.deleteExamType(7)).rejects.toThrow(
      'Cannot delete exam type: 3 exam(s) are using it'
    );
  });

  // Test Case ID: TC-TRINH-EXM-042
  it('deleteExamType should delete successfully when no exam uses this type', async () => {
    examRepositoryMock.countExamsByType.mockResolvedValue(0);
    examRepositoryMock.deleteExamType.mockResolvedValue(true);

    const deleted = await service.deleteExamType(7);

    expect(deleted).toBe(true);
  });

  // Test Case ID: TC-TRINH-EXM-043
  it('getNextOrderIndex should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getNextOrderIndex(999)).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-EXM-044
  it('getNextOrderIndex should return repository-provided next index', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.getNextOrderIndex.mockResolvedValue(18);

    const idx = await service.getNextOrderIndex(1);

    expect(idx).toBe(18);
  });

  // Test Case ID: TC-TRINH-EXM-045
  it('moveMediaGroupInExam should reject when user does not own exam', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam({ UserID: 77 }));

    await expect(service.moveMediaGroupInExam(1, 50, 10, 10)).rejects.toThrow(
      'You do not have permission to modify this exam'
    );
  });

  // Test Case ID: TC-TRINH-EXM-046
  it('validateExamStructure should throw when exam does not exist', async () => {
    examRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.validateExamStructure(1)).rejects.toThrow('Exam not found');
  });

  // Test Case ID: TC-TRINH-EXM-047
  it('validateExamStructure should return repository validation payload', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.validateExamStructure.mockResolvedValue({
      isValid: false,
      issues: ['Gap in OrderIndex sequence between 3 and 5'],
    });

    const result = await service.validateExamStructure(1);

    expect(result.isValid).toBe(false);
    expect(result.issues[0]).toContain('Gap in OrderIndex');
  });

  // Test Case ID: TC-TRINH-EXM-048
  it('getExamMediaGroupSummary should build fallback title when media metadata is missing', async () => {
    examRepositoryMock.getEnhancedStatistics.mockResolvedValue({
      totalQuestions: 10,
      totalMediaGroups: 1,
      questionsInGroups: 4,
      standaloneQuestions: 6,
      mediaGroupDetails: [
        {
          mediaQuestionId: 500,
          questionCount: 4,
        },
      ],
    });
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    const summary = await service.getExamMediaGroupSummary(1);

    expect(summary.totalQuestions).toBe(10);
    expect(summary.groupBreakdown[0].title).toBe('Part ?');
  });

  // Test Case ID: TC-TRINH-EXM-049
  it('getExamTypes should return exam type list from repository', async () => {
    examRepositoryMock.findAllExamTypes.mockResolvedValue([
      { ID: 1, Code: 'FULL' },
      { ID: 2, Code: 'MINI' },
    ]);

    const examTypes = await service.getExamTypes();

    expect(examTypes).toHaveLength(2);
  });

  // Test Case ID: TC-TRINH-EXM-050
  it('getExamStatistics should return enhanced statistics payload when exam exists', async () => {
    examRepositoryMock.findById.mockResolvedValue(makeBaseExam());
    examRepositoryMock.getEnhancedStatistics.mockResolvedValue({
      examId: 1,
      totalQuestions: 20,
      averageScore: 78.5,
    });

    const stats = await service.getExamStatistics(1);

    expect(stats.totalQuestions).toBe(20);
    expect(stats.averageScore).toBe(78.5);
  });
});
