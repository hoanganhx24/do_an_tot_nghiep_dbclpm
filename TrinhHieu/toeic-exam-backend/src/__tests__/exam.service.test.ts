/**
 * Unit Tests – ExamService
 * Coverage: TC-TRINH-EXAM-001 → TC-TRINH-EXAM-030
 *
 * Mock strategy:
 *   - ExamRepository, QuestionRepository, MediaQuestionRepository được mock.
 *   - Không kết nối database thật.
 *
 * Chú ý TC-TRINH-EXAM-004 (TimeExam > 240): Service đã validate
 * `TimeExam > 240` → PASS vì source code có: `examData.TimeExam > 240`.
 *
 * Chạy: npx jest src/__tests__/exam.service.test.ts --runInBand
 */

// ─── Mock repositories ────────────────────────────────────────────────────────
const mockExamRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addQuestions: jest.fn(),
  addQuestionsWithMediaTracking: jest.fn(),
  removeQuestions: jest.fn(),
  removeMediaGroup: jest.fn(),
  containsMediaGroup: jest.fn(),
  getOrganizedContent: jest.fn(),
  getEnhancedStatistics: jest.fn(),
  searchByTitle: jest.fn(),
};

const mockQuestionRepo = {
  findByIds: jest.fn(),
  findByMediaIds: jest.fn(),
  findByMediaQuestionId: jest.fn(),
};

const mockMediaQuestionRepo = {
  findById: jest.fn(),
};

jest.mock(
  '../infrastructure/repositories/exam.repository',
  () => ({ ExamRepository: jest.fn(() => mockExamRepo) })
);
jest.mock(
  '../infrastructure/repositories/question.repository',
  () => ({ QuestionRepository: jest.fn(() => mockQuestionRepo) })
);
jest.mock(
  '../infrastructure/repositories/media-question.repository',
  () => ({ MediaQuestionRepository: jest.fn(() => mockMediaQuestionRepo) })
);

import { ExamService } from '../application/services/exam.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeExam(overrides: Record<string, any> = {}) {
  return {
    ID: 1,
    Title: 'TOEIC Full Test 2024',
    TimeExam: 120,
    Type: 'FULL_TEST',
    ExamTypeID: 2,
    UserID: 10,
    examQuestions: [],
    attempts: [],
    examType: { ID: 2, Code: 'FULL', Description: 'Full TOEIC Test' },
    ...overrides,
  };
}

// ─── Test suites ──────────────────────────────────────────────────────────────
describe('ExamService', () => {
  let service: ExamService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExamService();
  });

  // ── createExam ───────────────────────────────────────────────────────────────

  describe('createExam()', () => {
    /** TC-TRINH-EXAM-001 */
    it('EXAM-001: throw lỗi khi Title rỗng', async () => {
      await expect(
        service.createExam({ Title: '', TimeExam: 60, Type: 'FULL_TEST', ExamTypeID: 2 } as any, 10)
      ).rejects.toThrow('Exam title cannot be empty');
      // CheckDB: create KHÔNG được gọi
      expect(mockExamRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-002 */
    it('EXAM-002: throw lỗi khi TimeExam < 1', async () => {
      await expect(
        service.createExam({ Title: 'Test', TimeExam: 0, Type: 'FULL_TEST', ExamTypeID: 2 } as any, 10)
      ).rejects.toThrow('Exam time must be between 1 and 240 minutes');
      expect(mockExamRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-003 */
    it('EXAM-003: tạo thành công với Title hợp lệ và TimeExam=120', async () => {
      const created = makeExam({ ID: 2 });
      mockExamRepo.create.mockResolvedValue(created);
      mockExamRepo.findById.mockResolvedValue(created);

      const result = await service.createExam(
        { Title: 'TOEIC Full Test 2024', TimeExam: 120, Type: 'FULL_TEST', ExamTypeID: 2 } as any,
        10
      );

      // CheckDB: create được gọi đúng 1 lần
      expect(mockExamRepo.create).toHaveBeenCalledTimes(1);
      expect(result.Title).toBe('TOEIC Full Test 2024');
    });

    /**
     * TC-TRINH-EXAM-004 – PASS (Source có validate: TimeExam > 240 → throw)
     * Expected: hệ thống ném lỗi "Exam time must be between 1 and 240 minutes"
     */
    it('EXAM-004: throw lỗi khi TimeExam > 240', async () => {
      await expect(
        service.createExam(
          { Title: 'Siêu dài', TimeExam: 500, Type: 'FULL_TEST', ExamTypeID: 2 } as any,
          10
        )
      ).rejects.toThrow('Exam time must be between 1 and 240 minutes');
      expect(mockExamRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-005 */
    it('EXAM-005: throw lỗi khi question không tồn tại trong DB', async () => {
      const created = makeExam({ ID: 5 });
      mockExamRepo.create.mockResolvedValue(created);
      // Truyền 3 questionID nhưng DB chỉ trả về 2
      mockQuestionRepo.findByIds.mockResolvedValue([{ ID: 1 }, { ID: 2 }]);

      await expect(
        service.createExam(
          {
            Title: 'Test',
            TimeExam: 60,
            Type: 'FULL_TEST',
            ExamTypeID: 2,
            questions: [
              { QuestionID: 1, OrderIndex: 1 },
              { QuestionID: 2, OrderIndex: 2 },
              { QuestionID: 999, OrderIndex: 3 },
            ],
          } as any,
          10
        )
      ).rejects.toThrow('Some questions do not exist');
    });

    /** TC-TRINH-EXAM-006 */
    it('EXAM-006: throw lỗi khi MediaQuestionIDs không có question', async () => {
      const created = makeExam({ ID: 6 });
      mockExamRepo.create.mockResolvedValue(created);
      mockQuestionRepo.findByMediaIds.mockResolvedValue([]);

      await expect(
        service.createExam(
          {
            Title: 'Test',
            TimeExam: 60,
            Type: 'FULL_TEST',
            ExamTypeID: 2,
            MediaQuestionIDs: [88],
          } as any,
          10
        )
      ).rejects.toThrow('No questions found for selected media blocks');
    });

    /** TC-TRINH-EXAM-007 */
    it('EXAM-007: throw lỗi khi reload exam sau khi tạo trả về null', async () => {
      mockExamRepo.create.mockResolvedValue(makeExam({ ID: 7 }));
      mockExamRepo.findById.mockResolvedValue(null); // reload thất bại

      await expect(
        service.createExam(
          { Title: 'Test', TimeExam: 60, Type: 'FULL_TEST', ExamTypeID: 2 } as any,
          10
        )
      ).rejects.toThrow('Failed to retrieve created exam');
    });
  });

  // ── getExamById ──────────────────────────────────────────────────────────────

  describe('getExamById()', () => {
    /** TC-TRINH-EXAM-008 */
    it('EXAM-008: throw lỗi khi exam không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(null);
      await expect(service.getExamById(99)).rejects.toThrow('Exam not found');
    });

    /** TC-TRINH-EXAM-009 */
    it('EXAM-009: trả về ExamDetailResponseDto khi exam tồn tại', async () => {
      const exam = makeExam({
        examQuestions: [{
          QuestionID: 1, OrderIndex: 1,
          question: {
            ID: 1, QuestionText: 'Q1',
            mediaQuestion: { Skill: 'LISTENING', Type: 'Part1', Section: '1', AudioUrl: 'https://ex.com/a.mp3', ImageUrl: 'https://ex.com/i.jpg', Scirpt: null },
            choices: [
              { ID: 10, Attribute: 'A', Content: 'cat', IsCorrect: true },
              { ID: 11, Attribute: 'B', Content: 'dog', IsCorrect: false },
            ],
          },
        }],
      });
      mockExamRepo.findById.mockResolvedValue(exam);

      const result = await service.getExamById(1);

      expect(result).toHaveProperty('ID', 1);
      expect(result.Questions[0].Choices[0]).not.toHaveProperty('IsCorrect'); // Ẩn đáp án
    });
  });

  // ── updateExam ───────────────────────────────────────────────────────────────

  describe('updateExam()', () => {
    /** TC-TRINH-EXAM-010 */
    it('EXAM-010: throw lỗi khi exam không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(null);
      await expect(service.updateExam(99, { Title: 'Mới' } as any, 10)).rejects.toThrow(
        'Exam not found'
      );
      expect(mockExamRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-011 */
    it('EXAM-011: từ chối khi không phải creator của exam', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 99 }));
      await expect(service.updateExam(1, { Title: 'Mới' } as any, 10)).rejects.toThrow(
        'You do not have permission to update this exam'
      );
      expect(mockExamRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-012 */
    it('EXAM-012: throw lỗi khi TimeExam cập nhật < 1', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      await expect(
        service.updateExam(1, { TimeExam: 0 } as any, 10)
      ).rejects.toThrow('Exam time must be between 1 and 240 minutes');
      expect(mockExamRepo.update).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-013 */
    it('EXAM-013: cập nhật thành công khi dữ liệu hợp lệ', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      const updated = makeExam({ Title: 'TOEIC Test mới' });
      mockExamRepo.update.mockResolvedValue(updated);

      const result = await service.updateExam(1, { Title: 'TOEIC Test mới' } as any, 10);

      // CheckDB: update được gọi đúng 1 lần
      expect(mockExamRepo.update).toHaveBeenCalledTimes(1);
      expect(result.Title).toBe('TOEIC Test mới');
    });
  });

  // ── deleteExam ───────────────────────────────────────────────────────────────

  describe('deleteExam()', () => {
    /** TC-TRINH-EXAM-014 */
    it('EXAM-014: throw lỗi khi exam không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(null);
      await expect(service.deleteExam(99, 10)).rejects.toThrow('Exam not found');
      expect(mockExamRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-015 */
    it('EXAM-015: từ chối xóa khi không phải creator', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 99 }));
      await expect(service.deleteExam(1, 10)).rejects.toThrow(
        'You do not have permission to delete this exam'
      );
      expect(mockExamRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-016 */
    it('EXAM-016: từ chối xóa khi đã có học sinh làm bài', async () => {
      mockExamRepo.findById.mockResolvedValue(
        makeExam({ UserID: 10, attempts: [{ ID: 100 }] })
      );
      await expect(service.deleteExam(1, 10)).rejects.toThrow(
        /Cannot delete exam that has been taken/
      );
      expect(mockExamRepo.delete).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-017 */
    it('EXAM-017: xóa thành công khi chưa có attempts', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10, attempts: [] }));
      mockExamRepo.delete.mockResolvedValue(true);

      const result = await service.deleteExam(1, 10);

      // CheckDB: delete được gọi đúng 1 lần
      expect(mockExamRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });

  // ── addQuestionsToExam ────────────────────────────────────────────────────────

  describe('addQuestionsToExam()', () => {
    /** TC-TRINH-EXAM-018 */
    it('EXAM-018: throw lỗi khi một số questions không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      mockQuestionRepo.findByIds.mockResolvedValue([{ ID: 1 }]); // chỉ có 1, truyền 2

      await expect(
        service.addQuestionsToExam(
          1,
          [{ QuestionID: 1, OrderIndex: 1 }, { QuestionID: 999, OrderIndex: 2 }],
          10
        )
      ).rejects.toThrow('Some questions do not exist');
      expect(mockExamRepo.addQuestions).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-019 */
    it('EXAM-019: throw lỗi khi question đã có trong exam (duplicate)', async () => {
      mockExamRepo.findById.mockResolvedValue(
        makeExam({
          UserID: 10,
          examQuestions: [{ QuestionID: 1 }],
        })
      );
      mockQuestionRepo.findByIds.mockResolvedValue([{ ID: 1 }]);

      await expect(
        service.addQuestionsToExam(1, [{ QuestionID: 1, OrderIndex: 2 }], 10)
      ).rejects.toThrow(/are already in this exam/);
      expect(mockExamRepo.addQuestions).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-020 */
    it('EXAM-020: thêm question thành công', async () => {
      mockExamRepo.findById
        .mockResolvedValueOnce(makeExam({ UserID: 10, examQuestions: [] })) // first call – validate
        .mockResolvedValueOnce(makeExam({ UserID: 10 })); // second call – return updated
      mockQuestionRepo.findByIds.mockResolvedValue([{ ID: 101 }]);
      mockExamRepo.addQuestions.mockResolvedValue(undefined);

      const result = await service.addQuestionsToExam(
        1,
        [{ QuestionID: 101, OrderIndex: 1 }],
        10
      );

      // CheckDB: addQuestions được gọi đúng 1 lần
      expect(mockExamRepo.addQuestions).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('ID', 1);
    });
  });

  // ── removeQuestionsFromExam ───────────────────────────────────────────────────

  describe('removeQuestionsFromExam()', () => {
    /** TC-TRINH-EXAM-021 */
    it('EXAM-021: gọi repo.removeQuestions với đúng tham số', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      mockExamRepo.removeQuestions.mockResolvedValue(2);

      const removed = await service.removeQuestionsFromExam(1, [101, 102], 10);

      // CheckDB: removeQuestions được gọi với {examId:1, questionIds:[101,102]}
      expect(mockExamRepo.removeQuestions).toHaveBeenCalledWith(1, [101, 102]);
      expect(removed).toBe(2);
    });
  });

  // ── searchExams ──────────────────────────────────────────────────────────────

  describe('searchExams()', () => {
    /** TC-TRINH-EXAM-022 */
    it('EXAM-022: throw lỗi khi searchTerm rỗng', async () => {
      await expect(service.searchExams('')).rejects.toThrow('Search term cannot be empty');
      expect(mockExamRepo.searchByTitle).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-023 */
    it('EXAM-023: gọi repo.searchByTitle khi searchTerm hợp lệ', async () => {
      mockExamRepo.searchByTitle.mockResolvedValue([makeExam()]);
      const result = await service.searchExams('TOEIC');
      // CheckDB: searchByTitle được gọi với 'TOEIC'
      expect(mockExamRepo.searchByTitle).toHaveBeenCalledWith('TOEIC');
      expect(result.length).toBe(1);
    });
  });

  // ── duplicateExam ────────────────────────────────────────────────────────────

  describe('duplicateExam()', () => {
    /** TC-TRINH-EXAM-024 */
    it('EXAM-024: throw lỗi khi exam nguồn không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(null);
      await expect(service.duplicateExam(99, 10)).rejects.toThrow('Exam not found');
      expect(mockExamRepo.create).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-025 */
    it('EXAM-025: tạo bản sao với title = "<title> - Copy"', async () => {
      const original = makeExam({ Title: 'TOEIC Full Test 2024' });
      mockExamRepo.findById
        .mockResolvedValueOnce(original) // tìm original
        .mockResolvedValueOnce(makeExam({ Title: 'TOEIC Full Test 2024 - Copy' })); // reload
      mockExamRepo.create.mockResolvedValue(makeExam({ ID: 99, Title: 'TOEIC Full Test 2024 - Copy' }));

      const result = await service.duplicateExam(1, 10);

      // CheckDB: create được gọi với Title ending in " - Copy"
      const callArg = mockExamRepo.create.mock.calls[0][0];
      expect(callArg.Title).toBe('TOEIC Full Test 2024 - Copy');
    });
  });

  // ── addMediaGroupToExam ───────────────────────────────────────────────────────

  describe('addMediaGroupToExam()', () => {
    /** TC-TRINH-EXAM-026 */
    it('EXAM-026: throw lỗi khi exam không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(null);
      await expect(service.addMediaGroupToExam(99, 1, 1, 10)).rejects.toThrow('Exam not found');
    });

    /** TC-TRINH-EXAM-027 */
    it('EXAM-027: throw lỗi khi media group không tồn tại', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      mockMediaQuestionRepo.findById.mockResolvedValue(null);
      await expect(service.addMediaGroupToExam(1, 999, 1, 10)).rejects.toThrow('Media group not found');
    });

    /** TC-TRINH-EXAM-028 */
    it('EXAM-028: throw lỗi khi media group đã có trong exam', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      mockMediaQuestionRepo.findById.mockResolvedValue({ ID: 5, GroupTitle: 'Part 1 set' });
      mockExamRepo.containsMediaGroup.mockResolvedValue(true);
      await expect(service.addMediaGroupToExam(1, 5, 1, 10)).rejects.toThrow(
        'This media group is already in the exam'
      );
      expect(mockExamRepo.addQuestionsWithMediaTracking).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-029 */
    it('EXAM-029: throw lỗi khi media group không có question nào', async () => {
      mockExamRepo.findById.mockResolvedValue(makeExam({ UserID: 10 }));
      mockMediaQuestionRepo.findById.mockResolvedValue({ ID: 5 });
      mockExamRepo.containsMediaGroup.mockResolvedValue(false);
      mockQuestionRepo.findByMediaQuestionId.mockResolvedValue([]);
      await expect(service.addMediaGroupToExam(1, 5, 1, 10)).rejects.toThrow(
        'Media group has no questions'
      );
      expect(mockExamRepo.addQuestionsWithMediaTracking).not.toHaveBeenCalled();
    });

    /** TC-TRINH-EXAM-030 */
    it('EXAM-030: thêm media group thành công và trả về số câu đúng', async () => {
      mockExamRepo.findById
        .mockResolvedValueOnce(makeExam({ UserID: 10 })) // bước validate
        .mockResolvedValueOnce(makeExam({ UserID: 10 })); // bước return
      mockMediaQuestionRepo.findById.mockResolvedValue({ ID: 5, GroupTitle: 'Part 1 set' });
      mockExamRepo.containsMediaGroup.mockResolvedValue(false);
      mockQuestionRepo.findByMediaQuestionId.mockResolvedValue([
        { ID: 10, OrderInGroup: 1 },
        { ID: 11, OrderInGroup: 2 },
        { ID: 12, OrderInGroup: 3 },
      ]);
      mockExamRepo.addQuestionsWithMediaTracking.mockResolvedValue(undefined);

      const result = await service.addMediaGroupToExam(1, 5, 1, 10);

      // CheckDB: addQuestionsWithMediaTracking được gọi với 3 câu
      expect(mockExamRepo.addQuestionsWithMediaTracking).toHaveBeenCalledTimes(1);
      expect(result.questionsAdded).toBe(3);
      expect(result.startOrderIndex).toBe(1);
      expect(result.endOrderIndex).toBe(3);
    });
  });
});
