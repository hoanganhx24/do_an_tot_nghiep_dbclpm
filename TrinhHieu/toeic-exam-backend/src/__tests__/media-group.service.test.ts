/**
 * Unit Tests – MediaGroupService
 * Coverage: TC-TRINH-MG-001 → TC-TRINH-MG-021
 *
 * Mock strategy:
 *   - MediaQuestionRepository và QuestionRepository được mock.
 *   - Không kết nối database thật.
 *
 * Chạy: npx jest src/__tests__/media-group.service.test.ts --runInBand
 */

// ─── Mock repositories ────────────────────────────────────────────────────────
const mockMediaQuestionRepo = {
  findWithFilters: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  clone: jest.fn(),
  getUsageStats: jest.fn(),
};

const mockQuestionRepo = {
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

jest.mock(
  '../infrastructure/repositories/media-question.repository',
  () => ({ MediaQuestionRepository: jest.fn(() => mockMediaQuestionRepo) })
);
jest.mock(
  '../infrastructure/repositories/question.repository',
  () => ({ QuestionRepository: jest.fn(() => mockQuestionRepo) })
);

import { MediaGroupService } from '../application/services/media-group.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeMedia(overrides: Record<string, any> = {}) {
  return {
    ID: 1,
    GroupTitle: 'Part 1 – Photographs',
    GroupDescription: 'TOEIC Listening Part 1',
    Skill: 'LISTENING',
    Type: 'Part1',
    Section: '1',
    AudioUrl: 'https://res.cloudinary.com/test/audio/part1_001.mp3',
    ImageUrl: 'https://res.cloudinary.com/test/images/part1_001.jpg',
    Scirpt: null,
    Difficulty: 'MEDIUM',
    Tags: ['listening', 'part1'],
    OrderIndex: 0,
    questions: [
      {
        ID: 10, OrderInGroup: 1,
        choices: [
          { ID: 100, Attribute: 'A', Content: 'A man is reading.', IsCorrect: true },
          { ID: 101, Attribute: 'B', Content: 'A woman is writing.', IsCorrect: false },
        ],
        attemptAnswers: [],
      },
    ],
    ...overrides,
  };
}

function makeCreateDto(overrides: Record<string, any> = {}) {
  return {
    Title: 'Part 1 Set 001',
    Description: 'Test set',
    Media: {
      Skill: 'LISTENING',
      Type: 'Part1',
      Section: '1',
      AudioUrl: 'https://res.cloudinary.com/test/audio.mp3',
      ImageUrl: 'https://res.cloudinary.com/test/img.jpg',
    },
    Difficulty: 'MEDIUM',
    Tags: ['part1'],
    OrderIndex: 1,
    Questions: [
      {
        QuestionText: 'What is happening in the picture?',
        OrderInGroup: 1,
        Choices: [
          { Content: 'A man is reading.', Attribute: 'A', IsCorrect: true },
          { Content: 'A woman is typing.', Attribute: 'B', IsCorrect: false },
        ],
      },
    ],
    ...overrides,
  };
}

// ─── Test suites ──────────────────────────────────────────────────────────────
describe('MediaGroupService', () => {
  let service: MediaGroupService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MediaGroupService();
  });

  // ── getMediaGroupsForBrowsing ─────────────────────────────────────────────────

  describe('getMediaGroupsForBrowsing()', () => {
    /** TC-TRINH-MG-001 */
    it('MG-001: trả về danh sách groups với thông tin phân trang', async () => {
      const media = makeMedia();
      mockMediaQuestionRepo.findWithFilters.mockResolvedValue({
        mediaQuestions: [media],
        total: 1,
      });
      mockQuestionRepo.countByMediaQuestionId.mockResolvedValue(1);
      mockQuestionRepo.findFirstByMediaQuestionId.mockResolvedValue(media.questions[0]);
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 2, totalAttempts: 50 });

      const result = await service.getMediaGroupsForBrowsing({ Page: 1, Limit: 10 } as any);

      // CheckDB: findWithFilters được gọi với MinQuestions=1
      expect(mockMediaQuestionRepo.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ MinQuestions: 1 })
      );
      expect(result.total).toBe(1);
      expect(result.groups.length).toBe(1);
      expect(result.groups[0].HasAudio).toBe(true);
      expect(result.groups[0].HasImage).toBe(true);
      expect(result.pagination.CurrentPage).toBe(1);
    });

    /** TC-TRINH-MG-002 */
    it('MG-002: khi không có filter, dùng page=1 và limit=20 mặc định', async () => {
      mockMediaQuestionRepo.findWithFilters.mockResolvedValue({ mediaQuestions: [], total: 0 });

      const result = await service.getMediaGroupsForBrowsing();

      expect(result.pagination.Limit).toBe(20);
      expect(result.pagination.CurrentPage).toBe(1);
    });
  });

  // ── getMediaGroupDetail ──────────────────────────────────────────────────────

  describe('getMediaGroupDetail()', () => {
    /** TC-TRINH-MG-003 */
    it('MG-003: throw lỗi khi mediaGroupId không tồn tại', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(service.getMediaGroupDetail(99)).rejects.toThrow('Media group not found');
    });

    /** TC-TRINH-MG-004 */
    it('MG-004: trả về chi tiết đầy đủ và questions được sort theo OrderInGroup', async () => {
      const media = makeMedia({
        questions: [
          { ID: 12, OrderInGroup: 2, choices: [], attemptAnswers: [] },
          { ID: 11, OrderInGroup: 1, choices: [], attemptAnswers: [] },
        ],
      });
      mockMediaQuestionRepo.findById.mockResolvedValue(media);
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 1, totalAttempts: 10 });

      const result = await service.getMediaGroupDetail(1);

      expect(result.MediaQuestionID).toBe(1);
      // Kiểm tra sort: question OrderInGroup=1 phải đứng đầu
      expect(result.Questions[0].OrderInGroup).toBe(1);
      expect(result.Questions[1].OrderInGroup).toBe(2);
    });
  });

  // ── createMediaGroup ─────────────────────────────────────────────────────────

  describe('createMediaGroup()', () => {
    /** TC-TRINH-MG-005 */
    it('MG-005: throw lỗi khi Questions rỗng', async () => {
      await expect(
        service.createMediaGroup({ ...makeCreateDto(), Questions: [] } as any, 10)
      ).rejects.toThrow('Media group must have at least one question');
      // CheckDB: create KHÔNG được gọi
      expect(mockMediaQuestionRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-006 */
    it('MG-006: throw lỗi khi OrderInGroup bị trùng trong group', async () => {
      const dto = makeCreateDto({
        Questions: [
          { QuestionText: 'Q1', OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }] },
          { QuestionText: 'Q2', OrderInGroup: 1, Choices: [{ Content: 'C', Attribute: 'A', IsCorrect: true }, { Content: 'D', Attribute: 'B', IsCorrect: false }] },
        ],
      });
      await expect(service.createMediaGroup(dto as any, 10)).rejects.toThrow(
        'OrderInGroup values must be unique within the group'
      );
      expect(mockMediaQuestionRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-007 */
    it('MG-007: throw lỗi khi question có < 2 choices', async () => {
      const dto = makeCreateDto({
        Questions: [
          { QuestionText: 'Q1', OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }] },
        ],
      });
      await expect(service.createMediaGroup(dto as any, 10)).rejects.toThrow(
        /must have at least 2 choices/
      );
      expect(mockMediaQuestionRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-008 */
    it('MG-008: throw lỗi khi question có 0 correct answer', async () => {
      const dto = makeCreateDto({
        Questions: [
          {
            QuestionText: 'Q1', OrderInGroup: 1,
            Choices: [
              { Content: 'A', Attribute: 'A', IsCorrect: false },
              { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
          },
        ],
      });
      await expect(service.createMediaGroup(dto as any, 10)).rejects.toThrow(
        /must have exactly one correct answer/
      );
      expect(mockMediaQuestionRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-009 */
    it('MG-009: throw lỗi khi question có 2 correct answers', async () => {
      const dto = makeCreateDto({
        Questions: [
          {
            QuestionText: 'Q1', OrderInGroup: 1,
            Choices: [
              { Content: 'A', Attribute: 'A', IsCorrect: true },
              { Content: 'B', Attribute: 'B', IsCorrect: true },
            ],
          },
        ],
      });
      await expect(service.createMediaGroup(dto as any, 10)).rejects.toThrow(
        /must have exactly one correct answer/
      );
      expect(mockMediaQuestionRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-010 */
    it('MG-010: tạo thành công và gọi createMultipleForMedia đúng 1 lần', async () => {
      const mediaCreated = { ID: 55 };
      mockMediaQuestionRepo.create.mockResolvedValue(mediaCreated);
      mockQuestionRepo.createMultipleForMedia.mockResolvedValue([{ ID: 10 }]);
      // getMediaGroupDetail sẽ được gọi bên trong
      mockMediaQuestionRepo.findById.mockResolvedValue(makeMedia({ ID: 55 }));
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0, totalAttempts: 0 });

      const result = await service.createMediaGroup(makeCreateDto() as any, 10);

      // CheckDB: mediaQuestion.create được gọi với đúng Skill/Type
      expect(mockMediaQuestionRepo.create).toHaveBeenCalledTimes(1);
      const createArg = mockMediaQuestionRepo.create.mock.calls[0][0];
      expect(createArg.Skill).toBe('LISTENING');

      // CheckDB: questionRepo.createMultipleForMedia được gọi với mediaId=55
      expect(mockQuestionRepo.createMultipleForMedia).toHaveBeenCalledWith(55, expect.any(Array), 10);
      expect(result.MediaQuestionID).toBe(55);
    });
  });

  // ── updateMediaGroupMetadata ──────────────────────────────────────────────────

  describe('updateMediaGroupMetadata()', () => {
    /** TC-TRINH-MG-011 */
    it('MG-011: throw lỗi khi mediaGroupId không tồn tại', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateMediaGroupMetadata(99, { Title: 'Mới' } as any)
      ).rejects.toThrow('Media group not found');
      expect(mockMediaQuestionRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-012 */
    it('MG-012: cập nhật metadata thành công (Title, Difficulty, Tags)', async () => {
      mockMediaQuestionRepo.findById
        .mockResolvedValueOnce(makeMedia()) // lần đầu check tồn tại
        .mockResolvedValueOnce(makeMedia({ GroupTitle: 'Updated Title' })); // reload
      mockMediaQuestionRepo.update.mockResolvedValue(undefined);
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0, totalAttempts: 0 });

      const result = await service.updateMediaGroupMetadata(1, {
        Title: 'Updated Title',
        Difficulty: 'HARD',
        Tags: ['part1', 'advanced'],
      } as any);

      // CheckDB: update được gọi với đúng tham số
      expect(mockMediaQuestionRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ GroupTitle: 'Updated Title' })
      );
    });
  });

  // ── deleteMediaGroup ─────────────────────────────────────────────────────────

  describe('deleteMediaGroup()', () => {
    /** TC-TRINH-MG-013 */
    it('MG-013: throw lỗi khi mediaGroupId không tồn tại', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(service.deleteMediaGroup(99)).rejects.toThrow('Media group not found');
      expect(mockMediaQuestionRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-014 */
    it('MG-014: từ chối xóa khi đang được dùng trong đề thi', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(makeMedia());
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 3, totalAttempts: 100 });

      await expect(service.deleteMediaGroup(1)).rejects.toThrow(
        /Cannot delete media group: It is used in 3 exam/
      );
      // CheckDB: delete KHÔNG được gọi
      expect(mockMediaQuestionRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-015 */
    it('MG-015: xóa thành công khi không có đề thi nào dùng', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(makeMedia());
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0, totalAttempts: 0 });
      mockQuestionRepo.deleteByMediaQuestionId.mockResolvedValue(undefined);
      mockMediaQuestionRepo.delete.mockResolvedValue(true);

      const result = await service.deleteMediaGroup(1);

      // CheckDB: xóa questions trước, xóa media sau
      expect(mockQuestionRepo.deleteByMediaQuestionId).toHaveBeenCalledWith(1);
      expect(mockMediaQuestionRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });

  // ── cloneMediaGroup ──────────────────────────────────────────────────────────

  describe('cloneMediaGroup()', () => {
    /** TC-TRINH-MG-016 */
    it('MG-016: throw lỗi khi media group nguồn không tồn tại', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(service.cloneMediaGroup(99, 10)).rejects.toThrow('Media group not found');
      expect(mockMediaQuestionRepo.clone).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-017 */
    it('MG-017: throw lỗi khi clone trả về null', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(makeMedia());
      mockMediaQuestionRepo.clone.mockResolvedValue(null);
      await expect(service.cloneMediaGroup(1, 10)).rejects.toThrow('Failed to clone media question');
    });

    /** TC-TRINH-MG-018 */
    it('MG-018: clone thành công và gọi cloneQuestionsToMedia', async () => {
      mockMediaQuestionRepo.findById
        .mockResolvedValueOnce(makeMedia())                      // tìm original
        .mockResolvedValueOnce(makeMedia({ ID: 200, GroupTitle: 'Cloned' })); // reload detail
      mockMediaQuestionRepo.clone.mockResolvedValue({ ID: 200 });
      mockQuestionRepo.cloneQuestionsToMedia.mockResolvedValue(undefined);
      mockMediaQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0, totalAttempts: 0 });

      const result = await service.cloneMediaGroup(1, 10, 'Cloned');

      // CheckDB: clone được gọi với đúng tham số
      expect(mockMediaQuestionRepo.clone).toHaveBeenCalledWith(1, 'Cloned');
      // CheckDB: cloneQuestionsToMedia được gọi với (srcId=1, destId=200, userId=10)
      expect(mockQuestionRepo.cloneQuestionsToMedia).toHaveBeenCalledWith(1, 200, 10);
      expect(result.MediaQuestionID).toBe(200);
    });
  });

  // ── addQuestionToGroup ───────────────────────────────────────────────────────

  describe('addQuestionToGroup()', () => {
    /** TC-TRINH-MG-019 */
    it('MG-019: throw lỗi khi media group không tồn tại', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(
        service.addQuestionToGroup(99, { OrderInGroup: 2, Choices: [] }, 10)
      ).rejects.toThrow('Media group not found');
      expect(mockQuestionRepo.createMultipleForMedia).not.toHaveBeenCalled();
    });

    /** TC-TRINH-MG-020 */
    it('MG-020: throw lỗi khi OrderInGroup bị trùng', async () => {
      mockMediaQuestionRepo.findById.mockResolvedValue(makeMedia());
      mockQuestionRepo.isOrderInGroupUnique.mockResolvedValue(false);

      await expect(
        service.addQuestionToGroup(
          1,
          {
            OrderInGroup: 1,
            Choices: [
              { Content: 'A', Attribute: 'A', IsCorrect: true },
              { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
          },
          10
        )
      ).rejects.toThrow(/OrderInGroup 1 is already used/);
      expect(mockQuestionRepo.createMultipleForMedia).not.toHaveBeenCalled();
    });
  });

  // ── removeQuestionFromGroup ────────────────────────────────────────────────────

  describe('removeQuestionFromGroup()', () => {
    /** TC-TRINH-MG-021 */
    it('MG-021: throw lỗi khi question không thuộc media group', async () => {
      mockQuestionRepo.findById.mockResolvedValue({ ID: 200, MediaQuestionID: 99 }); // thuộc group khác
      await expect(service.removeQuestionFromGroup(1, 200)).rejects.toThrow(
        'Question not found in this media group'
      );
      expect(mockQuestionRepo.delete).not.toHaveBeenCalled();
    });
  });
});
