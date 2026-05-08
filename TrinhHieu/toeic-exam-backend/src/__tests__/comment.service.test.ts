/**
 * Unit Tests – CommentService
 * Coverage: TC-TRINH-CMT-001 → TC-TRINH-CMT-033
 *
 * Mock strategy:
 *   - CommentRepository được mock hoàn toàn bằng jest.fn().
 *   - Không kết nối database thật.
 *
 * Chạy: npx jest src/__tests__/comment.service.test.ts --runInBand
 */

// ─── Mock repositories ────────────────────────────────────────────────────────
const mockCommentRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByExamId: jest.fn(),
  getReplyCount: jest.fn(),
  getCommentThread: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
  findByStudentId: jest.fn(),
  getFlaggedComments: jest.fn(),
  searchComments: jest.fn(),
  getCountByExamId: jest.fn(),
  findAll: jest.fn(),
};

jest.mock(
  '../infrastructure/repositories/comment.repository',
  () => ({ CommentRepository: jest.fn(() => mockCommentRepo) })
);

import { CommentService } from '../application/services/comment.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeComment(overrides: Record<string, any> = {}) {
  return {
    ID: 1,
    Content: 'Bình luận test',
    ExamID: 11,
    ParentId: 0,
    StudentProfileID: 20,
    Status: 1,
    CreateAt: new Date(),
    studentProfile: { ID: 20, user: { FullName: 'Học sinh A' } },
    ...overrides,
  };
}

// ─── Test suites ──────────────────────────────────────────────────────────────
describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentService();
  });

  // ── createComment ────────────────────────────────────────────────────────────

  describe('createComment()', () => {
    /** TC-TRINH-CMT-001 */
    it('CMT-001: throw lỗi khi nội dung rỗng/khoảng trắng', async () => {
      await expect(
        service.createComment({ Content: '   ', ExamID: 11 } as any, 5)
      ).rejects.toThrow('Comment content cannot be empty');
      // CheckDB: create KHÔNG được gọi
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-002 */
    it('CMT-002: throw lỗi khi nội dung > 1000 ký tự', async () => {
      await expect(
        service.createComment({ Content: 'a'.repeat(1001), ExamID: 11 } as any, 5)
      ).rejects.toThrow('Comment content too long (max 1000 characters)');
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-003 */
    it('CMT-003: throw lỗi khi ParentId không tồn tại trong DB', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);
      await expect(
        service.createComment({ Content: 'Trả lời', ExamID: 11, ParentId: 999 } as any, 5)
      ).rejects.toThrow('Parent comment not found');
      // CheckDB: create KHÔNG được gọi
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-004 */
    it('CMT-004: throw lỗi khi bình luận cha thuộc đề thi khác', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ ExamID: 10 }));
      await expect(
        service.createComment({ Content: 'Trả lời', ExamID: 11, ParentId: 8 } as any, 5)
      ).rejects.toThrow('Cannot reply to comment from different exam');
      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-005 */
    it('CMT-005: tạo top-level comment thành công với ParentId=0', async () => {
      const created = makeComment({ ID: 100, ParentId: 0, Status: 1 });
      mockCommentRepo.create.mockResolvedValue(created);

      const result = await service.createComment(
        { Content: 'Bình luận đề thi hay!', ExamID: 11, ParentId: 0 } as any,
        5
      );

      // CheckDB: create được gọi với ParentId=0 và Status=1
      expect(mockCommentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ParentId: 0, Status: 1, ExamID: 11 })
      );
      expect(result.ID).toBe(100);
    });

    /** TC-TRINH-CMT-006 */
    it('CMT-006: tạo reply thành công khi bình luận cha hợp lệ (cùng ExamID)', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ ID: 6, ExamID: 11 }));
      const created = makeComment({ ID: 101, ParentId: 6 });
      mockCommentRepo.create.mockResolvedValue(created);

      const result = await service.createComment(
        { Content: 'Đồng ý với ý kiến trên', ExamID: 11, ParentId: 6 } as any,
        5
      );

      // CheckDB: create được gọi với ParentId=6
      expect(mockCommentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ParentId: 6 })
      );
      expect(result.ParentId).toBe(6);
    });
  });

  // ── getExamComments ──────────────────────────────────────────────────────────

  describe('getExamComments()', () => {
    /** TC-TRINH-CMT-007 */
    it('CMT-007: trả về danh sách bình luận với phân trang và replyCount', async () => {
      const comments = [makeComment()];
      mockCommentRepo.findByExamId.mockResolvedValue({ comments, total: 1 });
      mockCommentRepo.getReplyCount.mockResolvedValue(2);

      const result = await service.getExamComments(11, { Page: 1, Limit: 10, Status: 1 } as any);

      // CheckDB: findByExamId được gọi với đúng tham số
      expect(mockCommentRepo.findByExamId).toHaveBeenCalledWith(
        11,
        expect.objectContaining({ Page: 1, Limit: 10, Status: 1 })
      );
      expect(result.Comments.length).toBe(1);
      expect(result.Pagination.TotalComments).toBe(1);
    });

    /** TC-TRINH-CMT-008 */
    it('CMT-008: dùng page=1, limit=20 khi không truyền filter', async () => {
      mockCommentRepo.findByExamId.mockResolvedValue({ comments: [], total: 0 });

      const result = await service.getExamComments(11);

      const callArg = mockCommentRepo.findByExamId.mock.calls[0][1];
      // Default: page=1, limit=20
      expect(callArg.Page).toBeUndefined(); // service truyền nguyên filters undefined → repo xử lý
      expect(result.Pagination.Limit).toBe(20);
      expect(result.Pagination.CurrentPage).toBe(1);
    });
  });

  // ── getCommentThread ─────────────────────────────────────────────────────────

  describe('getCommentThread()', () => {
    /** TC-TRINH-CMT-009 */
    it('CMT-009: throw lỗi khi CommentID không tồn tại', async () => {
      mockCommentRepo.getCommentThread.mockResolvedValue(null);
      await expect(service.getCommentThread(99)).rejects.toThrow('Comment not found');
    });

    /** TC-TRINH-CMT-010 */
    it('CMT-010: trả về toàn bộ thread khi CommentID tồn tại', async () => {
      const thread = makeComment({ replies: [makeComment({ ID: 2 }), makeComment({ ID: 3 })] });
      mockCommentRepo.getCommentThread.mockResolvedValue(thread);

      const result = await service.getCommentThread(1);

      // CheckDB: getCommentThread được gọi đúng 1 lần
      expect(mockCommentRepo.getCommentThread).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('ID', 1);
    });
  });

  // ── updateComment ────────────────────────────────────────────────────────────

  describe('updateComment()', () => {
    /** TC-TRINH-CMT-011 */
    it('CMT-011: throw lỗi khi CommentID không tồn tại', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateComment(1, { Content: 'Mới' } as any, 20)
      ).rejects.toThrow('Comment not found');
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-012 */
    it('CMT-012: từ chối khi không phải tác giả (UserID=5, request=20)', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 5 }));
      await expect(
        service.updateComment(1, { Content: 'Mới' } as any, 20)
      ).rejects.toThrow('You can only edit your own comments');
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-013 */
    it('CMT-013: throw lỗi khi nội dung cập nhật rỗng', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 20 }));
      await expect(
        service.updateComment(1, { Content: '  ' } as any, 20)
      ).rejects.toThrow('Comment content cannot be empty');
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-014 */
    it('CMT-014: throw lỗi khi nội dung > 1000 ký tự', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 20 }));
      await expect(
        service.updateComment(1, { Content: 'x'.repeat(1001) } as any, 20)
      ).rejects.toThrow('Comment content too long (max 1000 characters)');
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-015 */
    it('CMT-015: throw lỗi khi repo.update trả về null', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 20 }));
      mockCommentRepo.update.mockResolvedValue(null);
      await expect(
        service.updateComment(1, { Content: 'Nội dung mới hợp lệ' } as any, 20)
      ).rejects.toThrow('Failed to update comment');
    });

    /** TC-TRINH-CMT-016 */
    it('CMT-016: cập nhật thành công và trả về bình luận đã cập nhật', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 20 }));
      const updated = makeComment({ Content: 'Nội dung đã chỉnh sửa' });
      mockCommentRepo.update.mockResolvedValue(updated);

      const result = await service.updateComment(1, { Content: 'Nội dung đã chỉnh sửa' } as any, 20);

      // CheckDB: update được gọi đúng 1 lần
      expect(mockCommentRepo.update).toHaveBeenCalledTimes(1);
      expect(result.Content).toBe('Nội dung đã chỉnh sửa');
    });
  });

  // ── deleteComment ────────────────────────────────────────────────────────────

  describe('deleteComment()', () => {
    /** TC-TRINH-CMT-017 */
    it('CMT-017: throw lỗi khi CommentID không tồn tại', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);
      await expect(service.deleteComment(1, 20)).rejects.toThrow('Comment not found');
      expect(mockCommentRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-018 */
    it('CMT-018: từ chối xóa khi không phải tác giả và isAdmin=false', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 5 }));
      await expect(service.deleteComment(1, 20, false)).rejects.toThrow(
        "You can only delete your own comments"
      );
      expect(mockCommentRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-019 */
    it('CMT-019: admin được phép xóa bất kỳ bình luận (isAdmin=true)', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment({ StudentProfileID: 5 }));
      mockCommentRepo.getReplyCount.mockResolvedValue(0);
      mockCommentRepo.delete.mockResolvedValue(true);

      const result = await service.deleteComment(1, 20, true);

      // CheckDB: delete được gọi đúng 1 lần
      expect(mockCommentRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });

  // ── moderateComment ──────────────────────────────────────────────────────────

  describe('moderateComment()', () => {
    /** TC-TRINH-CMT-020 */
    it('CMT-020: throw lỗi khi CommentID không tồn tại', async () => {
      mockCommentRepo.findById.mockResolvedValue(null);
      await expect(service.moderateComment(1, { Status: 2 } as any)).rejects.toThrow(
        'Comment not found'
      );
      expect(mockCommentRepo.updateStatus).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-021 */
    it('CMT-021: throw lỗi khi repo.updateStatus ném exception', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment());
      mockCommentRepo.updateStatus.mockRejectedValue(new Error('DB error'));
      await expect(service.moderateComment(1, { Status: 3 } as any)).rejects.toThrow('DB error');
    });

    /** TC-TRINH-CMT-022 */
    it('CMT-022: cập nhật trạng thái kiểm duyệt thành công', async () => {
      mockCommentRepo.findById.mockResolvedValue(makeComment());
      const updated = makeComment({ Status: 2 });
      mockCommentRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.moderateComment(1, { Status: 2 } as any);

      // CheckDB: updateStatus được gọi với {commentId:1, status:2}
      expect(mockCommentRepo.updateStatus).toHaveBeenCalledWith(1, 2);
      expect(result.Status).toBe(2);
    });
  });

  // ── getStudentComments ───────────────────────────────────────────────────────

  describe('getStudentComments()', () => {
    /** TC-TRINH-CMT-023 */
    it('CMT-023: gọi repo với studentId và limit đúng', async () => {
      mockCommentRepo.findByStudentId.mockResolvedValue([makeComment(), makeComment()]);
      const result = await service.getStudentComments(20, 5);
      // CheckDB: findByStudentId được gọi với {studentId:20, limit:5}
      expect(mockCommentRepo.findByStudentId).toHaveBeenCalledWith(20, 5);
    });
  });

  // ── getFlaggedComments ────────────────────────────────────────────────────────

  describe('getFlaggedComments()', () => {
    /** TC-TRINH-CMT-024 */
    it('CMT-024: gọi repo.getFlaggedComments đúng 1 lần', async () => {
      mockCommentRepo.getFlaggedComments.mockResolvedValue([makeComment({ Status: 3 })]);
      const result = await service.getFlaggedComments();
      // CheckDB: getFlaggedComments được gọi đúng 1 lần
      expect(mockCommentRepo.getFlaggedComments).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(1);
    });
  });

  // ── searchComments ────────────────────────────────────────────────────────────

  describe('searchComments()', () => {
    /** TC-TRINH-CMT-025 */
    it('CMT-025: throw lỗi khi searchText rỗng/khoảng trắng', async () => {
      await expect(service.searchComments('  ')).rejects.toThrow(
        'Search text cannot be empty'
      );
      // CheckDB: searchComments repo KHÔNG được gọi
      expect(mockCommentRepo.searchComments).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-026 */
    it('CMT-026: gọi repo với từ khóa và examId khi hợp lệ', async () => {
      mockCommentRepo.searchComments.mockResolvedValue([makeComment()]);
      await service.searchComments('TOEIC', 11);
      // CheckDB: searchComments được gọi với đúng tham số
      expect(mockCommentRepo.searchComments).toHaveBeenCalledWith('TOEIC', 11);
    });
  });

  // ── getExamCommentCount ───────────────────────────────────────────────────────

  describe('getExamCommentCount()', () => {
    /** TC-TRINH-CMT-027 */
    it('CMT-027: trả về số lượng bình luận của đề thi', async () => {
      mockCommentRepo.getCountByExamId.mockResolvedValue(42);
      const count = await service.getExamCommentCount(11);
      // CheckDB: getCountByExamId được gọi đúng 1 lần
      expect(mockCommentRepo.getCountByExamId).toHaveBeenCalledWith(11);
      expect(count).toBe(42);
    });
  });

  // ── getAllComments ─────────────────────────────────────────────────────────────

  describe('getAllComments()', () => {
    /** TC-TRINH-CMT-028 */
    it('CMT-028: throw lỗi khi page < 1', async () => {
      await expect(
        service.getAllComments({ page: 0, limit: 20 })
      ).rejects.toThrow('Page must be greater than 0');
      expect(mockCommentRepo.findAll).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-029 */
    it('CMT-029: throw lỗi khi limit > 100', async () => {
      await expect(
        service.getAllComments({ page: 1, limit: 101 })
      ).rejects.toThrow('Limit must be between 1 and 100');
      expect(mockCommentRepo.findAll).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-030 */
    it('CMT-030: throw lỗi khi order không phải ASC hoặc DESC', async () => {
      await expect(
        service.getAllComments({ page: 1, limit: 20, order: 'DOWN' as any })
      ).rejects.toThrow('Order must be ASC or DESC');
      expect(mockCommentRepo.findAll).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-031 */
    it('CMT-031: throw lỗi khi sortBy không hợp lệ', async () => {
      await expect(
        service.getAllComments({ page: 1, limit: 20, sortBy: 'random' })
      ).rejects.toThrow('SortBy must be one of: createdAt, updatedAt, likes');
      expect(mockCommentRepo.findAll).not.toHaveBeenCalled();
    });

    /** TC-TRINH-CMT-032 */
    it('CMT-032: dùng status=1 (mặc định) và trả về pagination đúng', async () => {
      mockCommentRepo.findAll.mockResolvedValue({ comments: [], total: 0 });

      const result = await service.getAllComments({ page: 1, limit: 1 });

      // CheckDB: findAll được gọi với status=1 mặc định
      const callArg = mockCommentRepo.findAll.mock.calls[0][0];
      expect(callArg.status).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
    });

    /** TC-TRINH-CMT-033 */
    it('CMT-033: truyền đúng toàn bộ tham số lọc xuống repository', async () => {
      mockCommentRepo.findAll.mockResolvedValue({ comments: [], total: 0 });

      await service.getAllComments({
        page: 2,
        limit: 10,
        status: 3,
        sortBy: 'updatedAt',
        order: 'ASC',
      });

      // CheckDB: findAll được gọi với đúng tất cả tham số
      expect(mockCommentRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          status: 3,
          sortBy: 'updatedAt',
          order: 'ASC',
        })
      );
    });
  });
});
