import 'reflect-metadata';
import { EntityManager, QueryRunner } from 'typeorm';
import { CommentService } from '../application/services/comment.service';
import {
  AppDataSource,
  closeDatabase,
  initializeDatabase,
} from '../infrastructure/database/config';
import { Comment } from '../domain/entities/comment.entity';
import { Exam } from '../domain/entities/exam.entity';
import { ExamType } from '../domain/entities/exam-type.entity';
import { StudentProfile } from '../domain/entities/student-profile.entity';
import { User } from '../domain/entities/user.entity';

jest.setTimeout(30000);

function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

async function createStudent(
  manager: EntityManager,
  prefix: string
): Promise<StudentProfile> {
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
      TargetScore: 650,
      DailyStudyMinutes: 45,
      PlacementLevel: 'INTERMEDIATE',
    })
  );
}

async function createExam(
  manager: EntityManager,
  overrides: Partial<Exam> = {}
): Promise<Exam> {
  const examTypeRepository = manager.getRepository(ExamType);
  const examRepository = manager.getRepository(Exam);

  const examType = await examTypeRepository.save(
    examTypeRepository.create({
      Code: uniqueValue('EXAM_TYPE'),
      Description: 'Comment test exam type',
    })
  );

  return await examRepository.save(
    examRepository.create({
      Title: uniqueValue('Comment Exam'),
      TimeExam: 120,
      Type: 'FULL_TEST',
      ExamTypeID: examType.ID,
      ...overrides,
    })
  );
}

async function createCommentRecord(
  manager: EntityManager,
  overrides: Partial<Comment>
): Promise<Comment> {
  const repository = manager.getRepository(Comment);
  return await repository.save(
    repository.create({
      Content: 'Bình luận test',
      ParentId: 0,
      Status: 1,
      CreateAt: new Date(),
      ...overrides,
    })
  );
}

describe('CommentService', () => {
  let queryRunner: QueryRunner;
  let manager: EntityManager;
  let service: CommentService;
  let getRepositorySpy: jest.SpyInstance;

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

    service = new CommentService();
  });

  afterEach(async () => {
    getRepositorySpy.mockRestore();

    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    await queryRunner.release();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Hàm: createComment() - Tạo bình luận mới', () => {
    it('TC-TRINH-CMT-001 — Không cho phép tạo bình luận với nội dung rỗng', async () => {
      await expect(
        service.createComment({ Content: '   ', ExamID: 11 } as any, 5)
      ).rejects.toThrow('Comment content cannot be empty');
    });

    it('TC-TRINH-CMT-002 — Không cho phép bình luận dài quá 1000 ký tự', async () => {
      await expect(
        service.createComment({ Content: 'a'.repeat(1001), ExamID: 11 } as any, 5)
      ).rejects.toThrow('Comment content too long (max 1000 characters)');
    });

    it('TC-TRINH-CMT-003 — Không thể reply vào một bình luận cha không tồn tại', async () => {
      const exam = await createExam(manager);
      const student = await createStudent(manager, 'reply-missing-parent');

      await expect(
        service.createComment(
          { Content: 'Trả lời', ExamID: exam.ID, ParentId: 999999 } as any,
          student.ID
        )
      ).rejects.toThrow('Parent comment not found');
    });

    it('TC-TRINH-CMT-004 — Không được phép reply chéo sang comment thuộc Exam khác', async () => {
      const student = await createStudent(manager, 'reply-cross');
      const examA = await createExam(manager, { Title: 'Exam A' });
      const examB = await createExam(manager, { Title: 'Exam B' });
      const parent = await createCommentRecord(manager, {
        ExamID: examA.ID,
        StudentProfileID: student.ID,
      });

      await expect(
        service.createComment(
          { Content: 'Trả lời', ExamID: examB.ID, ParentId: parent.ID } as any,
          student.ID
        )
      ).rejects.toThrow('Cannot reply to comment from different exam');
    });

    it('TC-TRINH-CMT-005 — Tạo bình luận gốc thành công', async () => {
      const student = await createStudent(manager, 'create-top');
      const exam = await createExam(manager);

      const result = await service.createComment(
        { Content: 'Bình luận đề thi hay!', ExamID: exam.ID, ParentId: 0 } as any,
        student.ID
      );

      const saved = await manager.getRepository(Comment).findOneByOrFail({ ID: result.ID });
      expect(saved.ParentId).toBe(0);
      expect(saved.Status).toBe(1);
      expect(saved.ExamID).toBe(exam.ID);
    });

    it('TC-TRINH-CMT-006 — Tạo phản hồi thành công khi bình luận cha hợp lệ', async () => {
      const student = await createStudent(manager, 'create-reply');
      const exam = await createExam(manager);
      const parent = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
      });

      const result = await service.createComment(
        { Content: 'Đồng ý với ý kiến trên', ExamID: exam.ID, ParentId: parent.ID } as any,
        student.ID
      );

      expect(result.ParentId).toBe(parent.ID);
    });

    it('TC-TRINH-CMT-007 — Kiểm tra ExamID có thực sự tồn tại hay không khi tạo comment gốc', async () => {
      const student = await createStudent(manager, 'missing-exam');

      await expect(
        service.createComment(
          { Content: 'Bình luận rác', ExamID: 99999, ParentId: 0 } as any,
          student.ID
        )
      ).rejects.toThrow('Exam not found');
    });

    it('TC-TRINH-CMT-008 — Kiểm tra chặn trả lời vào một bình luận đã bị ẩn/khóa', async () => {
      const student = await createStudent(manager, 'reply-hidden');
      const exam = await createExam(manager);
      const parent = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        Status: 2,
      });

      await expect(
        service.createComment(
          { Content: 'Trả lời cmt ẩn', ExamID: exam.ID, ParentId: parent.ID } as any,
          student.ID
        )
      ).rejects.toThrow(/Cannot reply to a hidden/i);
    });
  });

  describe('Hàm: getExamComments() - Lấy danh sách bình luận của đề thi', () => {
    it('TC-TRINH-CMT-009 — Trả về danh sách bình luận kèm phân trang và số lượng reply', async () => {
      const student = await createStudent(manager, 'get-exam-comments');
      const exam = await createExam(manager);
      const root = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: 0,
      });
      await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: root.ID,
      });
      await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: root.ID,
      });

      const result = await service.getExamComments(
        exam.ID,
        { Page: 1, Limit: 10, Status: 1 } as any
      );

      expect(result.Comments.length).toBe(3);
      expect(result.Pagination.TotalComments).toBe(3);
      expect(result.Comments.find((comment) => comment.ID === root.ID)?.ReplyCount).toBe(2);
    });
  });

  describe('Hàm: getCommentThread() - Lấy chi tiết chuỗi bình luận', () => {
    it('TC-TRINH-CMT-010 — Không cho phép xem nếu bình luận gốc không tồn tại', async () => {
      await expect(service.getCommentThread(999999)).rejects.toThrow('Comment not found');
    });

    it('TC-TRINH-CMT-011 — Trả về đúng comment gốc kèm replies approved theo cây', async () => {
      const student = await createStudent(manager, 'thread-success');
      const exam = await createExam(manager);
      const root = await createCommentRecord(manager, {
        Content: 'Comment gốc',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: 0,
        Status: 1,
      });
      const reply = await createCommentRecord(manager, {
        Content: 'Reply cấp 1',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: root.ID,
        Status: 1,
      });
      await createCommentRecord(manager, {
        Content: 'Reply bị ẩn',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: root.ID,
        Status: 2,
      });
      await createCommentRecord(manager, {
        Content: 'Reply cấp 2',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: reply.ID,
        Status: 1,
      });

      const result = await service.getCommentThread(root.ID);

      expect(result.ID).toBe(root.ID);
      expect((result as any).replies).toHaveLength(1);
      expect((result as any).replies[0].ID).toBe(reply.ID);
      expect((result as any).replies[0].replies).toHaveLength(1);
    });
  });

  describe('Hàm: getStudentComments() - Lấy danh sách bình luận theo học sinh', () => {
    it('TC-TRINH-CMT-012 — Chỉ trả về bình luận approved của đúng học sinh, không lấy nhầm người khác', async () => {
      const studentA = await createStudent(manager, 'student-comments-a');
      const studentB = await createStudent(manager, 'student-comments-b');
      const exam = await createExam(manager);

      const ownApproved = await createCommentRecord(manager, {
        Content: 'Đúng học sinh approved',
        ExamID: exam.ID,
        StudentProfileID: studentA.ID,
        Status: 1,
      });
      await createCommentRecord(manager, {
        Content: 'Đúng học sinh hidden',
        ExamID: exam.ID,
        StudentProfileID: studentA.ID,
        Status: 2,
      });
      await createCommentRecord(manager, {
        Content: 'Người khác approved',
        ExamID: exam.ID,
        StudentProfileID: studentB.ID,
        Status: 1,
      });

      const result = await service.getStudentComments(studentA.ID);

      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe(ownApproved.ID);
      expect(result.every((comment) => comment.StudentProfileID === studentA.ID)).toBe(true);
    });
  });

  describe('Hàm: getFlaggedComments() - Lấy danh sách bình luận bị flag', () => {
    it('TC-TRINH-CMT-013 — Chỉ trả về comment bị flag, không lấy nhầm comment approved', async () => {
      const student = await createStudent(manager, 'flagged-comments');
      const exam = await createExam(manager);

      const flagged = await createCommentRecord(manager, {
        Content: 'Comment bị flag',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        Status: 3,
      });
      await createCommentRecord(manager, {
        Content: 'Comment approved',
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        Status: 1,
      });

      const result = await service.getFlaggedComments();

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((comment) => comment.ID === flagged.ID)).toBe(true);
      expect(result.every((comment) => comment.Status === 3)).toBe(true);
    });
  });

  describe('Hàm: searchComments() - Tìm kiếm bình luận', () => {
    it('TC-TRINH-CMT-014 — Tìm đúng comment theo từ khóa và ExamID, không lấy nhầm exam khác', async () => {
      const student = await createStudent(manager, 'search-comments');
      const examA = await createExam(manager, { Title: 'Search Exam A' });
      const examB = await createExam(manager, { Title: 'Search Exam B' });

      const matched = await createCommentRecord(manager, {
        Content: 'keyword cần tìm trong exam A',
        ExamID: examA.ID,
        StudentProfileID: student.ID,
        Status: 1,
      });
      await createCommentRecord(manager, {
        Content: 'keyword cần tìm trong exam B',
        ExamID: examB.ID,
        StudentProfileID: student.ID,
        Status: 1,
      });
      await createCommentRecord(manager, {
        Content: 'nội dung không liên quan',
        ExamID: examA.ID,
        StudentProfileID: student.ID,
        Status: 1,
      });

      const result = await service.searchComments('keyword', examA.ID);

      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe(matched.ID);
      expect(result[0].ExamID).toBe(examA.ID);
    });

    it('TC-TRINH-CMT-015 — Không cho phép tìm kiếm với từ khóa rỗng', async () => {
      await expect(service.searchComments('   ')).rejects.toThrow('Search text cannot be empty');
    });
  });

  describe('Hàm: updateComment() - Sửa nội dung bình luận', () => {
    it('TC-TRINH-CMT-016 — Không thể sửa một bình luận không tồn tại', async () => {
      await expect(
        service.updateComment(999999, { Content: 'Mới' } as any, 20)
      ).rejects.toThrow('Comment not found');
    });

    it('TC-TRINH-CMT-017 — Không được phép sửa bình luận của người khác', async () => {
      const owner = await createStudent(manager, 'edit-owner');
      const otherStudent = await createStudent(manager, 'edit-other');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: owner.ID,
      });

      await expect(
        service.updateComment(comment.ID, { Content: 'Mới' } as any, otherStudent.ID)
      ).rejects.toThrow('You can only edit your own comments');
    });

    it('TC-TRINH-CMT-018 — Không cho phép sửa nội dung thành rỗng', async () => {
      const student = await createStudent(manager, 'edit-empty');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
      });

      await expect(
        service.updateComment(comment.ID, { Content: '  ' } as any, student.ID)
      ).rejects.toThrow('Comment content cannot be empty');
    });

    it('TC-TRINH-CMT-019 — Không cho phép sửa bình luận vượt quá 1000 ký tự', async () => {
      const student = await createStudent(manager, 'edit-too-long');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
      });

      await expect(
        service.updateComment(comment.ID, { Content: 'a'.repeat(1001) } as any, student.ID)
      ).rejects.toThrow('Comment content too long (max 1000 characters)');
    });

    it('TC-TRINH-CMT-020 — Học sinh sửa bình luận của chính mình thành công', async () => {
      const student = await createStudent(manager, 'edit-own');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
      });

      const result = await service.updateComment(
        comment.ID,
        { Content: 'Nội dung đã chỉnh sửa' } as any,
        student.ID
      );

      expect(result.Content).toBe('Nội dung đã chỉnh sửa');
    });

    it('TC-TRINH-CMT-021 — Không cho phép học sinh sửa bình luận đã bị Admin ẩn/khóa', async () => {
      const student = await createStudent(manager, 'edit-hidden');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        Status: 2,
      });

      await expect(
        service.updateComment(comment.ID, { Content: 'Sửa bậy bạ' } as any, student.ID)
      ).rejects.toThrow(/edit a hidden/i);
    });
  });

  describe('Hàm: deleteComment() - Xóa bình luận', () => {
    it('TC-TRINH-CMT-022 — Không thể xóa bình luận không tồn tại', async () => {
      await expect(service.deleteComment(999999, 20)).rejects.toThrow('Comment not found');
    });

    it('TC-TRINH-CMT-023 — Không được phép xóa bình luận của người khác nếu không phải Admin', async () => {
      const owner = await createStudent(manager, 'delete-owner');
      const otherStudent = await createStudent(manager, 'delete-other');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: owner.ID,
      });

      await expect(service.deleteComment(comment.ID, otherStudent.ID, false)).rejects.toThrow(
        'You can only delete your own comments'
      );
    });

    it('TC-TRINH-CMT-024 — Admin được đặc quyền xóa bất kỳ bình luận nào', async () => {
      const owner = await createStudent(manager, 'delete-admin-owner');
      const admin = await createStudent(manager, 'delete-admin');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: owner.ID,
      });

      const result = await service.deleteComment(comment.ID, admin.ID, true);
      const deleted = await manager.getRepository(Comment).findOneBy({ ID: comment.ID });

      expect(result).toBe(true);
      expect(deleted).toBeNull();
    });

    it('TC-TRINH-CMT-025 — Xóa comment gốc sẽ xóa kèm replies trong cây', async () => {
      const student = await createStudent(manager, 'delete-with-replies');
      const exam = await createExam(manager);
      const root = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: 0,
      });
      const reply = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: root.ID,
      });
      const nestedReply = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
        ParentId: reply.ID,
      });

      const result = await service.deleteComment(root.ID, student.ID, false);

      expect(result).toBe(true);
      expect(await manager.getRepository(Comment).findOneBy({ ID: root.ID })).toBeNull();
      expect(await manager.getRepository(Comment).findOneBy({ ID: reply.ID })).toBeNull();
      expect(await manager.getRepository(Comment).findOneBy({ ID: nestedReply.ID })).toBeNull();
    });
  });

  describe('Hàm: moderateComment() - Kiểm duyệt bình luận (Admin)', () => {
    it('TC-TRINH-CMT-026 — Không thể kiểm duyệt một bình luận không tồn tại', async () => {
      await expect(service.moderateComment(999999, { Status: 2 } as any)).rejects.toThrow(
        'Comment not found'
      );
    });

    it('TC-TRINH-CMT-027 — Cập nhật trạng thái kiểm duyệt thành công', async () => {
      const student = await createStudent(manager, 'moderate');
      const exam = await createExam(manager);
      const comment = await createCommentRecord(manager, {
        ExamID: exam.ID,
        StudentProfileID: student.ID,
      });

      const result = await service.moderateComment(comment.ID, { Status: 2 } as any);

      expect(result.Status).toBe(2);
    });
  });

  describe('Hàm: getAllComments() - Lấy tất cả bình luận (Admin Dashboard)', () => {
    it('TC-TRINH-CMT-028 — Không cho phép truy vấn trang nhỏ hơn 1', async () => {
      await expect(service.getAllComments({ page: 0, limit: 20 })).rejects.toThrow(
        'Page must be greater than 0'
      );
    });

    it('TC-TRINH-CMT-029 — Không cho phép limit nằm ngoài khoảng 1..100', async () => {
      await expect(service.getAllComments({ page: 1, limit: 101 })).rejects.toThrow(
        'Limit must be between 1 and 100'
      );
    });
  });
});
