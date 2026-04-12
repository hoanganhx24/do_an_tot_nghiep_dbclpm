import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MediaGroupService } from './media-group.service';
import { MediaQuestionRepository } from '../../infrastructure/repositories/media-question.repository';
import { QuestionRepository } from '../../infrastructure/repositories/question.repository';

jest.mock('../../infrastructure/repositories/media-question.repository', () => ({
  MediaQuestionRepository: jest.fn(),
}));

jest.mock('../../infrastructure/repositories/question.repository', () => ({
  QuestionRepository: jest.fn(),
}));

describe('MediaGroupService', () => {
  let service: MediaGroupService;
  let mediaQuestionRepositoryMock: any;
  let questionRepositoryMock: any;

  const makeQuestion = (id: number, orderInGroup: number, text = 'Question text') => ({
    ID: id,
    QuestionText: text,
    OrderInGroup: orderInGroup,
    choices: [
      { ID: 1, Attribute: 'A', Content: 'Option A', IsCorrect: true },
      { ID: 2, Attribute: 'B', Content: 'Option B', IsCorrect: false },
    ],
    attemptAnswers: [],
  });

  const makeMedia = (id = 10, overrides: any = {}) => ({
    ID: id,
    GroupTitle: 'Part 7 Group',
    GroupDescription: 'Reading passage group',
    Skill: 'READING',
    Type: 'READING_COMPREHENSION',
    Section: '7',
    AudioUrl: null,
    ImageUrl: '/images/passage.png',
    Scirpt: 'Reading script',
    Difficulty: 'MEDIUM',
    Tags: ['part7', 'inference'],
    OrderIndex: 2,
    questions: [makeQuestion(100, 2), makeQuestion(101, 1)],
    ...overrides,
  });

  beforeEach(() => {
    mediaQuestionRepositoryMock = {
      findWithFilters: jest.fn(),
      getUsageStats: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      clone: jest.fn(),
    };

    questionRepositoryMock = {
      countByMediaQuestionId: jest.fn(),
      findFirstByMediaQuestionId: jest.fn(),
      createMultipleForMedia: jest.fn(),
      deleteByMediaQuestionId: jest.fn(),
      cloneQuestionsToMedia: jest.fn(),
      getNextOrderInGroup: jest.fn(),
      isOrderInGroupUnique: jest.fn(),
      findById: jest.fn(),
      getUsageStats: jest.fn(),
      delete: jest.fn(),
    };

    (MediaQuestionRepository as unknown as jest.Mock).mockImplementation(
      () => mediaQuestionRepositoryMock
    );
    (QuestionRepository as unknown as jest.Mock).mockImplementation(
      () => questionRepositoryMock
    );

    service = new MediaGroupService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-TRINH-MGR-001
  it('getMediaGroupsForBrowsing should request MinQuestions=1 and build summary with fallback count/preview', async () => {
    const media = makeMedia(10, { questions: [] });

    mediaQuestionRepositoryMock.findWithFilters.mockResolvedValue({
      mediaQuestions: [media],
      total: 1,
    });
    questionRepositoryMock.countByMediaQuestionId.mockResolvedValue(3);
    questionRepositoryMock.findFirstByMediaQuestionId.mockResolvedValue(
      makeQuestion(999, 1, 'First question for preview')
    );
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      usedInExams: 4,
      totalAttempts: 25,
    });

    const result = await service.getMediaGroupsForBrowsing({
      Skill: 'READING',
      Page: 2,
      Limit: 5,
    } as any);

    expect(mediaQuestionRepositoryMock.findWithFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        Skill: 'READING',
        Page: 2,
        Limit: 5,
        MinQuestions: 1,
      })
    );
    expect(result.groups[0].QuestionCount).toBe(3);
    expect(result.groups[0].PreviewText).toContain('First question');
    expect(result.groups[0].UsageCount).toBe(4);
    expect(result.pagination.CurrentPage).toBe(2);
    expect(result.pagination.TotalPages).toBe(1);
  });

  // Test Case ID: TC-TRINH-MGR-002
  it('getMediaGroupsForBrowsing should use loaded questions and generated default title when GroupTitle missing', async () => {
    const media = makeMedia(11, {
      GroupTitle: '',
      Type: 'INCOMPLETE_SENTENCE',
      Section: '5',
      questions: [makeQuestion(1, 1, 'Preview from loaded relation')],
    });

    mediaQuestionRepositoryMock.findWithFilters.mockResolvedValue({
      mediaQuestions: [media],
      total: 1,
    });
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue(null);

    const result = await service.getMediaGroupsForBrowsing();

    expect(questionRepositoryMock.countByMediaQuestionId).not.toHaveBeenCalled();
    expect(questionRepositoryMock.findFirstByMediaQuestionId).not.toHaveBeenCalled();
    expect(result.groups[0].Title).toBe('INCOMPLETE_SENTENCE - Part 5');
    expect(result.groups[0].QuestionCount).toBe(1);
    expect(result.pagination.CurrentPage).toBe(1);
    expect(result.pagination.Limit).toBe(20);
  });

  // Test Case ID: TC-TRINH-MGR-003
  it('getMediaGroupsForBrowsing should truncate preview text to 100 chars + ellipsis', async () => {
    const longText = 'x'.repeat(130);
    const media = makeMedia(12, { questions: [makeQuestion(5, 1, longText)] });

    mediaQuestionRepositoryMock.findWithFilters.mockResolvedValue({
      mediaQuestions: [media],
      total: 1,
    });
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue(null);

    const result = await service.getMediaGroupsForBrowsing();

    expect(result.groups[0].PreviewText.endsWith('...')).toBe(true);
    expect(result.groups[0].PreviewText.length).toBe(103);
  });

  // Test Case ID: TC-TRINH-MGR-004
  it('getMediaGroupDetail should throw when media group does not exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getMediaGroupDetail(999)).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-005
  it('getMediaGroupDetail should sort questions by OrderInGroup and return mapped detail', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(
      makeMedia(20, {
        questions: [
          makeQuestion(10, 3, 'Q3'),
          makeQuestion(11, 1, 'Q1'),
          makeQuestion(12, 2, 'Q2'),
        ],
      })
    );
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      usedInExams: 7,
      totalAttempts: 100,
    });

    const result = await service.getMediaGroupDetail(20);

    expect(result.Questions.map((q) => q.OrderInGroup)).toEqual([1, 2, 3]);
    expect(result.TotalQuestions).toBe(3);
    expect(result.UsageStatistics.UsedInExams).toBe(7);
    expect(result.Media.Script).toBe('Reading script');
  });

  // Test Case ID: TC-TRINH-MGR-006
  it('createMediaGroup should reject when no questions are provided', async () => {
    await expect(
      service.createMediaGroup(
        {
          Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' },
          Questions: [],
        } as any,
        10
      )
    ).rejects.toThrow('Media group must have at least one question');
  });

  // Test Case ID: TC-TRINH-MGR-007
  it('createMediaGroup should reject duplicate OrderInGroup values', async () => {
    await expect(
      service.createMediaGroup(
        {
          Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' },
          Questions: [
            {
              OrderInGroup: 1,
              Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
              ],
            },
            {
              OrderInGroup: 1,
              Choices: [
                { Content: 'A2', Attribute: 'A', IsCorrect: true },
                { Content: 'B2', Attribute: 'B', IsCorrect: false },
              ],
            },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('OrderInGroup values must be unique within the group');
  });

  // Test Case ID: TC-TRINH-MGR-008
  it('createMediaGroup should reject question with less than 2 choices', async () => {
    await expect(
      service.createMediaGroup(
        {
          Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' },
          Questions: [
            {
              OrderInGroup: 1,
              Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }],
            },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Question at position 1 must have at least 2 choices');
  });

  // Test Case ID: TC-TRINH-MGR-009
  it('createMediaGroup should reject when question has zero correct answers', async () => {
    await expect(
      service.createMediaGroup(
        {
          Media: { Skill: 'READING', Type: 'READING_COMPREHENSION', Section: '7' },
          Questions: [
            {
              OrderInGroup: 1,
              Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: false },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
              ],
            },
          ],
        } as any,
        10
      )
    ).rejects.toThrow('Question at position 1 must have exactly one correct answer');
  });

  // Test Case ID: TC-TRINH-MGR-010
  it('createMediaGroup should create media and questions then return complete detail', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    mediaQuestionRepositoryMock.create.mockResolvedValue({ ID: 30 });
    questionRepositoryMock.createMultipleForMedia.mockResolvedValue([makeQuestion(1, 1)]);
    mediaQuestionRepositoryMock.findById.mockResolvedValue(
      makeMedia(30, {
        GroupTitle: 'Listening bundle',
        Skill: 'LISTENING',
        AudioUrl: null,
      })
    );
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      usedInExams: 0,
      totalAttempts: 0,
    });

    const result = await service.createMediaGroup(
      {
        Title: 'Listening bundle',
        Description: 'Create media group test',
        Media: {
          Skill: 'LISTENING',
          Type: 'SHORT_TALK',
          Section: '4',
          Script: 'Talk script',
        },
        Questions: [
          {
            QuestionText: 'Q1',
            OrderInGroup: 1,
            Choices: [
              { Content: 'A', Attribute: 'A', IsCorrect: true },
              { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
          },
        ],
      } as any,
      99
    );

    expect(mediaQuestionRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        GroupTitle: 'Listening bundle',
        GroupDescription: 'Create media group test',
        Skill: 'LISTENING',
        Type: 'SHORT_TALK',
        Section: '4',
        Scirpt: 'Talk script',
        Difficulty: 'MEDIUM',
      })
    );
    expect(questionRepositoryMock.createMultipleForMedia).toHaveBeenCalledWith(
      30,
      [
        {
          QuestionText: 'Q1',
          OrderInGroup: 1,
          Choices: [
            { Content: 'A', Attribute: 'A', IsCorrect: true },
            { Content: 'B', Attribute: 'B', IsCorrect: false },
          ],
        },
      ],
      99
    );
    expect(warnSpy).toHaveBeenCalledWith('Listening media group without audio URL');
    expect(result.MediaQuestionID).toBe(30);

    warnSpy.mockRestore();
  });

  // Test Case ID: TC-TRINH-MGR-011
  it('updateMediaGroupMetadata should throw when media group not found', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.updateMediaGroupMetadata(1, { Title: 'New title' } as any)
    ).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-012
  it('updateMediaGroupMetadata should map metadata and media fields before update', async () => {
    mediaQuestionRepositoryMock.findById
      .mockResolvedValueOnce(makeMedia(40))
      .mockResolvedValueOnce(makeMedia(40, { GroupTitle: 'Updated title' }));
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue(null);

    const result = await service.updateMediaGroupMetadata(
      40,
      {
        Title: 'Updated title',
        Description: 'Updated desc',
        Difficulty: 'HARD',
        Tags: ['updated'],
        Media: {
          Skill: 'READING',
          Type: 'READING_COMPREHENSION',
          Section: '7',
          AudioUrl: '/audio/new.mp3',
          ImageUrl: '/img/new.png',
          Script: 'Updated script',
        },
      } as any
    );

    expect(mediaQuestionRepositoryMock.update).toHaveBeenCalledWith(40, {
      GroupTitle: 'Updated title',
      GroupDescription: 'Updated desc',
      Difficulty: 'HARD',
      Tags: ['updated'],
      AudioUrl: '/audio/new.mp3',
      ImageUrl: '/img/new.png',
      Scirpt: 'Updated script',
    });
    expect(result.MediaQuestionID).toBe(40);
  });

  // Test Case ID: TC-TRINH-MGR-013
  it('updateMediaGroupMetadata should allow partial update payload', async () => {
    mediaQuestionRepositoryMock.findById
      .mockResolvedValueOnce(makeMedia(41))
      .mockResolvedValueOnce(makeMedia(41));
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue(null);

    await service.updateMediaGroupMetadata(41, { Tags: ['new-tag'] } as any);

    expect(mediaQuestionRepositoryMock.update).toHaveBeenCalledWith(41, {
      Tags: ['new-tag'],
    });
  });

  // Test Case ID: TC-TRINH-MGR-014
  it('deleteMediaGroup should throw when media group does not exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.deleteMediaGroup(50)).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-015
  it('deleteMediaGroup should reject when group is used in exams', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(50));
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 2 });

    await expect(service.deleteMediaGroup(50)).rejects.toThrow(
      'Cannot delete media group: It is used in 2 exam(s)'
    );
  });

  // Test Case ID: TC-TRINH-MGR-016
  it('deleteMediaGroup should delete child questions first then media record', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(51));
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });
    questionRepositoryMock.deleteByMediaQuestionId.mockResolvedValue(3);
    mediaQuestionRepositoryMock.delete.mockResolvedValue(true);

    const deleted = await service.deleteMediaGroup(51);

    expect(questionRepositoryMock.deleteByMediaQuestionId).toHaveBeenCalledWith(51);
    expect(mediaQuestionRepositoryMock.delete).toHaveBeenCalledWith(51);
    expect(deleted).toBe(true);
  });

  // Test Case ID: TC-TRINH-MGR-017
  it('getMediaGroupStatistics should throw when media group does not exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.getMediaGroupStatistics(60)).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-018
  it('getMediaGroupStatistics should compute rounded average success rate when attempts exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(
      makeMedia(60, {
        questions: [
          {
            ...makeQuestion(1, 1),
            attemptAnswers: [
              { IsCorrect: true },
              { IsCorrect: true },
              { IsCorrect: false },
            ],
          },
          {
            ...makeQuestion(2, 2),
            attemptAnswers: [{ IsCorrect: true }, { IsCorrect: false }],
          },
        ],
      })
    );
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      questionCount: 2,
      usedInExams: 4,
      totalAttempts: 6,
    });

    const stats = await service.getMediaGroupStatistics(60);

    expect(stats.questionCount).toBe(2);
    expect(stats.usedInExams).toBe(4);
    expect(stats.totalAttempts).toBe(6);
    expect(stats.averageSuccessRate).toBe(50);
  });

  // Test Case ID: TC-TRINH-MGR-019
  it('getMediaGroupStatistics should return undefined averageSuccessRate when totalAttempts is zero', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(61));
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      questionCount: 2,
      usedInExams: 1,
      totalAttempts: 0,
    });

    const stats = await service.getMediaGroupStatistics(61);

    expect(stats.averageSuccessRate).toBeUndefined();
  });

  // Test Case ID: TC-TRINH-MGR-020
  it('cloneMediaGroup should throw when source media does not exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.cloneMediaGroup(70, 10)).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-021
  it('cloneMediaGroup should throw when repository clone returns null', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(70));
    mediaQuestionRepositoryMock.clone.mockResolvedValue(null);

    await expect(service.cloneMediaGroup(70, 10)).rejects.toThrow(
      'Failed to clone media question'
    );
  });

  // Test Case ID: TC-TRINH-MGR-022
  it('cloneMediaGroup should clone media, clone questions, and return cloned detail', async () => {
    mediaQuestionRepositoryMock.findById
      .mockResolvedValueOnce(makeMedia(70))
      .mockResolvedValueOnce(makeMedia(80, { GroupTitle: 'Clone title' }));
    mediaQuestionRepositoryMock.clone.mockResolvedValue({ ID: 80 });
    questionRepositoryMock.cloneQuestionsToMedia.mockResolvedValue([
      makeQuestion(500, 1),
      makeQuestion(501, 2),
    ]);
    mediaQuestionRepositoryMock.getUsageStats.mockResolvedValue({
      usedInExams: 0,
      totalAttempts: 0,
    });

    const cloned = await service.cloneMediaGroup(70, 77, 'Clone title');

    expect(mediaQuestionRepositoryMock.clone).toHaveBeenCalledWith(70, 'Clone title');
    expect(questionRepositoryMock.cloneQuestionsToMedia).toHaveBeenCalledWith(70, 80, 77);
    expect(cloned.MediaQuestionID).toBe(80);
  });

  // Test Case ID: TC-TRINH-MGR-023
  it('addQuestionToGroup should throw when media group does not exist', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.addQuestionToGroup(
        90,
        {
          OrderInGroup: 1,
          Choices: [
            { Content: 'A', Attribute: 'A', IsCorrect: true },
            { Content: 'B', Attribute: 'B', IsCorrect: false },
          ],
        },
        10
      )
    ).rejects.toThrow('Media group not found');
  });

  // Test Case ID: TC-TRINH-MGR-024
  it('addQuestionToGroup should auto-assign OrderInGroup when missing', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(90));
    questionRepositoryMock.getNextOrderInGroup.mockResolvedValue(6);
    questionRepositoryMock.isOrderInGroupUnique.mockResolvedValue(true);
    questionRepositoryMock.createMultipleForMedia.mockResolvedValue([
      makeQuestion(901, 6, 'Auto order question'),
    ]);

    const created = await service.addQuestionToGroup(
      90,
      {
        OrderInGroup: 0,
        Choices: [
          { Content: 'A', Attribute: 'A', IsCorrect: true },
          { Content: 'B', Attribute: 'B', IsCorrect: false },
        ],
      },
      10
    );

    expect(questionRepositoryMock.getNextOrderInGroup).toHaveBeenCalledWith(90);
    expect(questionRepositoryMock.createMultipleForMedia).toHaveBeenCalledWith(
      90,
      [
        {
          OrderInGroup: 6,
          Choices: [
            { Content: 'A', Attribute: 'A', IsCorrect: true },
            { Content: 'B', Attribute: 'B', IsCorrect: false },
          ],
        },
      ],
      10
    );
    expect(created.OrderInGroup).toBe(6);
  });

  // Test Case ID: TC-TRINH-MGR-025
  it('addQuestionToGroup should reject duplicate OrderInGroup', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(91));
    questionRepositoryMock.isOrderInGroupUnique.mockResolvedValue(false);

    await expect(
      service.addQuestionToGroup(
        91,
        {
          OrderInGroup: 2,
          Choices: [
            { Content: 'A', Attribute: 'A', IsCorrect: true },
            { Content: 'B', Attribute: 'B', IsCorrect: false },
          ],
        },
        10
      )
    ).rejects.toThrow('OrderInGroup 2 is already used in this media group');
  });

  // Test Case ID: TC-TRINH-MGR-026
  it('addQuestionToGroup should create question when order is unique', async () => {
    mediaQuestionRepositoryMock.findById.mockResolvedValue(makeMedia(92));
    questionRepositoryMock.isOrderInGroupUnique.mockResolvedValue(true);
    questionRepositoryMock.createMultipleForMedia.mockResolvedValue([
      makeQuestion(902, 2, 'Created question'),
    ]);

    const created = await service.addQuestionToGroup(
      92,
      {
        QuestionText: 'Created question',
        OrderInGroup: 2,
        Choices: [
          { Content: 'A', Attribute: 'A', IsCorrect: true },
          { Content: 'B', Attribute: 'B', IsCorrect: false },
        ],
      },
      10
    );

    expect(created.ID).toBe(902);
  });

  // Test Case ID: TC-TRINH-MGR-027
  it('removeQuestionFromGroup should throw when question not found', async () => {
    questionRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.removeQuestionFromGroup(100, 200)).rejects.toThrow(
      'Question not found in this media group'
    );
  });

  // Test Case ID: TC-TRINH-MGR-028
  it('removeQuestionFromGroup should throw when question belongs to different media group', async () => {
    questionRepositoryMock.findById.mockResolvedValue({ ID: 200, MediaQuestionID: 999 });

    await expect(service.removeQuestionFromGroup(100, 200)).rejects.toThrow(
      'Question not found in this media group'
    );
  });

  // Test Case ID: TC-TRINH-MGR-029
  it('removeQuestionFromGroup should block removal when question is used in exams', async () => {
    questionRepositoryMock.findById.mockResolvedValue({ ID: 200, MediaQuestionID: 100 });
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 3 });

    await expect(service.removeQuestionFromGroup(100, 200)).rejects.toThrow(
      'Cannot remove question: It is used in 3 exam(s)'
    );
  });

  // Test Case ID: TC-TRINH-MGR-030
  it('removeQuestionFromGroup should delete question when it has no exam usage', async () => {
    questionRepositoryMock.findById.mockResolvedValue({ ID: 200, MediaQuestionID: 100 });
    questionRepositoryMock.getUsageStats.mockResolvedValue({ usedInExams: 0 });
    questionRepositoryMock.delete.mockResolvedValue(true);

    const removed = await service.removeQuestionFromGroup(100, 200);

    expect(questionRepositoryMock.delete).toHaveBeenCalledWith(200);
    expect(removed).toBe(true);
  });
});
