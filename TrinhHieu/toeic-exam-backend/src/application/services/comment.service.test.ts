import { CommentService } from './comment.service';
import { CommentRepository } from '../../infrastructure/repositories/comment.repository';

jest.mock('../../infrastructure/repositories/comment.repository', () => ({
  CommentRepository: jest.fn(),
}));

describe('CommentService', () => {
  let service: CommentService;
  let commentRepositoryMock: any;

  const makeComment = (id: number, examId: number, studentId: number, content = 'Noi dung') => ({
    ID: id,
    Content: content,
    CreateAt: new Date('2026-04-12T09:00:00.000Z'),
    ParentId: 0,
    Status: 1,
    ExamID: examId,
    StudentProfileID: studentId,
    studentProfile: {
      ID: studentId,
      user: {
        FullName: `Student ${studentId}`,
      },
    },
  });

  beforeEach(() => {
    commentRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findByExamId: jest.fn(),
      getReplyCount: jest.fn(),
      getCommentThread: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      findByStudentId: jest.fn(),
      getFlaggedComments: jest.fn(),
      searchComments: jest.fn(),
      getCountByExamId: jest.fn(),
      findAll: jest.fn(),
    };

    (CommentRepository as unknown as jest.Mock).mockImplementation(
      () => commentRepositoryMock
    );

    service = new CommentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case ID: TC-TRINH-CMT-001
  it('createComment should reject empty content', async () => {
    await expect(
      service.createComment(
        { Content: '   ', ExamID: 11, ParentId: 0 } as any,
        20
      )
    ).rejects.toThrow('Comment content cannot be empty');
  });

  // Test Case ID: TC-TRINH-CMT-002
  it('createComment should reject content length greater than 1000', async () => {
    await expect(
      service.createComment(
        { Content: 'a'.repeat(1001), ExamID: 11, ParentId: 0 } as any,
        20
      )
    ).rejects.toThrow('Comment content too long (max 1000 characters)');
  });

  // Test Case ID: TC-TRINH-CMT-003
  it('createComment should reject reply when parent comment is not found', async () => {
    commentRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.createComment(
        { Content: 'Reply', ExamID: 11, ParentId: 999 } as any,
        20
      )
    ).rejects.toThrow('Parent comment not found');
  });

  // Test Case ID: TC-TRINH-CMT-004
  it('createComment should reject reply when parent belongs to different exam', async () => {
    commentRepositoryMock.findById.mockResolvedValue(
      makeComment(8, 999, 40, 'Parent o exam khac')
    );

    await expect(
      service.createComment(
        { Content: 'Reply', ExamID: 11, ParentId: 8 } as any,
        20
      )
    ).rejects.toThrow('Cannot reply to comment from different exam');
  });

  // Test Case ID: TC-TRINH-CMT-005
  it('createComment should create top-level comment with ParentId=0 and Status=1', async () => {
    const created = makeComment(101, 11, 20, 'Top level');
    commentRepositoryMock.create.mockResolvedValue(created);

    const result = await service.createComment(
      { Content: 'Top level', ExamID: 11, ParentId: 0 } as any,
      20
    );

    expect(commentRepositoryMock.create).toHaveBeenCalledWith({
      Content: 'Top level',
      ExamID: 11,
      ParentId: 0,
      StudentProfileID: 20,
      Status: 1,
    });
    expect(result.ID).toBe(101);
  });

  // Test Case ID: TC-TRINH-CMT-006
  it('createComment should create reply when parent is valid and same exam', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(6, 11, 30, 'Parent'));
    commentRepositoryMock.create.mockResolvedValue(makeComment(102, 11, 20, 'Reply hop le'));

    const result = await service.createComment(
      { Content: 'Reply hop le', ExamID: 11, ParentId: 6 } as any,
      20
    );

    expect(commentRepositoryMock.findById).toHaveBeenCalledWith(6);
    expect(commentRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(result.ID).toBe(102);
  });

  // Test Case ID: TC-TRINH-CMT-007
  it('getExamComments should return paginated comments and include reply counts', async () => {
    const c1 = makeComment(1, 11, 20, 'C1');
    const c2 = makeComment(2, 11, 21, 'C2');

    commentRepositoryMock.findByExamId.mockResolvedValue({
      comments: [c1, c2],
      total: 2,
    });
    commentRepositoryMock.getReplyCount.mockResolvedValueOnce(3).mockResolvedValueOnce(0);

    const result = await service.getExamComments(11, {
      Status: 1,
      ParentId: 0,
      Page: 1,
      Limit: 10,
    } as any);

    expect(commentRepositoryMock.findByExamId).toHaveBeenCalledWith(11, {
      Status: 1,
      ParentId: 0,
      Page: 1,
      Limit: 10,
    });
    expect(result.Comments).toHaveLength(2);
    expect(result.Comments[0].ReplyCount).toBe(3);
    expect(result.Comments[1].ReplyCount).toBe(0);
    expect(result.Pagination.TotalPages).toBe(1);
  });

  // Test Case ID: TC-TRINH-CMT-008
  it('getExamComments should apply default page=1 and limit=20 when filters absent', async () => {
    commentRepositoryMock.findByExamId.mockResolvedValue({
      comments: [makeComment(10, 11, 20, 'Default')],
      total: 1,
    });
    commentRepositoryMock.getReplyCount.mockResolvedValue(0);

    const result = await service.getExamComments(11);

    expect(result.Pagination.CurrentPage).toBe(1);
    expect(result.Pagination.Limit).toBe(20);
  });

  // Test Case ID: TC-TRINH-CMT-009
  it('getCommentThread should throw when parent comment is not found', async () => {
    commentRepositoryMock.getCommentThread.mockResolvedValue(null);

    await expect(service.getCommentThread(99)).rejects.toThrow('Comment not found');
  });

  // Test Case ID: TC-TRINH-CMT-010
  it('getCommentThread should return full thread data from repository', async () => {
    const thread = {
      ...makeComment(1, 11, 20, 'Parent'),
      replies: [makeComment(2, 11, 21, 'Reply')],
    };
    commentRepositoryMock.getCommentThread.mockResolvedValue(thread);

    const result = await service.getCommentThread(1);

    expect(result).toEqual(thread);
  });

  // Test Case ID: TC-TRINH-CMT-011
  it('updateComment should throw when comment does not exist', async () => {
    commentRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.updateComment(1, { Content: 'New content' } as any, 20)
    ).rejects.toThrow('Comment not found');
  });

  // Test Case ID: TC-TRINH-CMT-012
  it('updateComment should reject when user is not author', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 99, 'Old'));

    await expect(
      service.updateComment(1, { Content: 'New content' } as any, 20)
    ).rejects.toThrow('You can only edit your own comments');
  });

  // Test Case ID: TC-TRINH-CMT-013
  it('updateComment should reject empty updated content', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'Old'));

    await expect(
      service.updateComment(1, { Content: '  ' } as any, 20)
    ).rejects.toThrow('Comment content cannot be empty');
  });

  // Test Case ID: TC-TRINH-CMT-014
  it('updateComment should reject content too long', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'Old'));

    await expect(
      service.updateComment(1, { Content: 'x'.repeat(1001) } as any, 20)
    ).rejects.toThrow('Comment content too long (max 1000 characters)');
  });

  // Test Case ID: TC-TRINH-CMT-015
  it('updateComment should throw when repository update returns null', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'Old'));
    commentRepositoryMock.update.mockResolvedValue(null);

    await expect(
      service.updateComment(1, { Content: 'New content' } as any, 20)
    ).rejects.toThrow('Failed to update comment');
  });

  // Test Case ID: TC-TRINH-CMT-016
  it('updateComment should return updated comment successfully', async () => {
    const updated = makeComment(1, 11, 20, 'Noi dung moi');
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'Old'));
    commentRepositoryMock.update.mockResolvedValue(updated);

    const result = await service.updateComment(1, { Content: 'Noi dung moi' } as any, 20);

    expect(commentRepositoryMock.update).toHaveBeenCalledWith(1, {
      Content: 'Noi dung moi',
    });
    expect(result.Content).toBe('Noi dung moi');
  });

  // Test Case ID: TC-TRINH-CMT-017
  it('deleteComment should throw when comment does not exist', async () => {
    commentRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.deleteComment(1, 20)).rejects.toThrow('Comment not found');
  });

  // Test Case ID: TC-TRINH-CMT-018
  it('deleteComment should reject non-author when not admin', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 99, 'X'));

    await expect(service.deleteComment(1, 20, false)).rejects.toThrow(
      'You can only delete your own comments'
    );
  });

  // Test Case ID: TC-TRINH-CMT-019
  it('deleteComment should allow admin and return true', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 99, 'X'));
    commentRepositoryMock.getReplyCount.mockResolvedValue(2);
    commentRepositoryMock.delete.mockResolvedValue(true);

    const result = await service.deleteComment(1, 20, true);

    expect(commentRepositoryMock.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  // Test Case ID: TC-TRINH-CMT-020
  it('moderateComment should throw when comment does not exist', async () => {
    commentRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.moderateComment(1, { Status: 2 } as any)).rejects.toThrow(
      'Comment not found'
    );
  });

  // Test Case ID: TC-TRINH-CMT-021
  it('moderateComment should throw when repository updateStatus fails', async () => {
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'X'));
    commentRepositoryMock.updateStatus.mockResolvedValue(null);

    await expect(service.moderateComment(1, { Status: 3 } as any)).rejects.toThrow(
      'Failed to update comment status'
    );
  });

  // Test Case ID: TC-TRINH-CMT-022
  it('moderateComment should update status and return moderated comment', async () => {
    const moderated = { ...makeComment(1, 11, 20, 'X'), Status: 2 };
    commentRepositoryMock.findById.mockResolvedValue(makeComment(1, 11, 20, 'X'));
    commentRepositoryMock.updateStatus.mockResolvedValue(moderated);

    const result = await service.moderateComment(1, { Status: 2 } as any);

    expect(commentRepositoryMock.updateStatus).toHaveBeenCalledWith(1, 2);
    expect(result.Status).toBe(2);
  });

  // Test Case ID: TC-TRINH-CMT-023
  it('getStudentComments should delegate to repository with limit', async () => {
    const comments = [makeComment(1, 11, 20, 'A')];
    commentRepositoryMock.findByStudentId.mockResolvedValue(comments);

    const result = await service.getStudentComments(20, 5);

    expect(commentRepositoryMock.findByStudentId).toHaveBeenCalledWith(20, 5);
    expect(result).toEqual(comments);
  });

  // Test Case ID: TC-TRINH-CMT-024
  it('getFlaggedComments should return repository flagged list', async () => {
    const flagged = [
      { ...makeComment(1, 11, 20, 'Bad content'), Status: 3 },
      { ...makeComment(2, 11, 21, 'Spam'), Status: 3 },
    ];
    commentRepositoryMock.getFlaggedComments.mockResolvedValue(flagged);

    const result = await service.getFlaggedComments();

    expect(result).toHaveLength(2);
  });

  // Test Case ID: TC-TRINH-CMT-025
  it('searchComments should reject empty search text', async () => {
    await expect(service.searchComments('   ')).rejects.toThrow(
      'Search text cannot be empty'
    );
  });

  // Test Case ID: TC-TRINH-CMT-026
  it('searchComments should call repository with search text and examId', async () => {
    const found = [makeComment(1, 11, 20, 'co tu khoa TOEIC')];
    commentRepositoryMock.searchComments.mockResolvedValue(found);

    const result = await service.searchComments('TOEIC', 11);

    expect(commentRepositoryMock.searchComments).toHaveBeenCalledWith('TOEIC', 11);
    expect(result).toEqual(found);
  });

  // Test Case ID: TC-TRINH-CMT-027
  it('getExamCommentCount should return count from repository', async () => {
    commentRepositoryMock.getCountByExamId.mockResolvedValue(15);

    const count = await service.getExamCommentCount(11);

    expect(commentRepositoryMock.getCountByExamId).toHaveBeenCalledWith(11);
    expect(count).toBe(15);
  });

  // Test Case ID: TC-TRINH-CMT-028
  it('getAllComments should reject page less than 1', async () => {
    await expect(
      service.getAllComments({ page: 0, limit: 20 } as any)
    ).rejects.toThrow('Page must be greater than 0');
  });

  // Test Case ID: TC-TRINH-CMT-029
  it('getAllComments should reject limit outside 1-100', async () => {
    await expect(
      service.getAllComments({ page: 1, limit: 101 } as any)
    ).rejects.toThrow('Limit must be between 1 and 100');
  });

  // Test Case ID: TC-TRINH-CMT-030
  it('getAllComments should reject invalid order value', async () => {
    await expect(
      service.getAllComments({ page: 1, limit: 20, order: 'DOWN' as any })
    ).rejects.toThrow('Order must be ASC or DESC');
  });

  // Test Case ID: TC-TRINH-CMT-031
  it('getAllComments should reject invalid sortBy field', async () => {
    await expect(
      service.getAllComments({ page: 1, limit: 20, sortBy: 'random' } as any)
    ).rejects.toThrow('SortBy must be one of: createdAt, updatedAt, likes');
  });

  // Test Case ID: TC-TRINH-CMT-032
  it('getAllComments should use default status=1 and return pagination metadata', async () => {
    const oneComment = [makeComment(1, 11, 20, 'A')];
    commentRepositoryMock.findAll.mockResolvedValue({ comments: oneComment, total: 2 });
    commentRepositoryMock.getReplyCount.mockResolvedValue(1);

    const result = await service.getAllComments({ page: 1, limit: 1 } as any);

    expect(commentRepositoryMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      examId: undefined,
      status: 1,
      sortBy: 'createdAt',
      order: 'DESC',
    });
    expect(result.comments[0].ReplyCount).toBe(1);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasMore).toBe(true);
  });

  // Test Case ID: TC-TRINH-CMT-033
  it('getAllComments should pass explicit status filter to repository', async () => {
    commentRepositoryMock.findAll.mockResolvedValue({ comments: [], total: 0 });

    const result = await service.getAllComments({
      page: 2,
      limit: 10,
      status: 3,
      sortBy: 'updatedAt',
      order: 'ASC',
    } as any);

    expect(commentRepositoryMock.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      examId: undefined,
      status: 3,
      sortBy: 'updatedAt',
      order: 'ASC',
    });
    expect(result.pagination.hasMore).toBe(false);
  });
});
