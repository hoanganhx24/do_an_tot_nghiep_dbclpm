/**
 * Unit Test — QuestionService
 * File gốc  : src/application/services/question.service.ts
 * Test file : src/__tests__/question.service.test.ts
 * Người PT  : Trịnh Quang Hiếu
 * Test Cases: TC-TRINH-QST-001 → TC-TRINH-QST-027
 *
 * Rollback  : Toàn bộ test dùng jest.mock() để mock QuestionRepository,
 *             không kết nối DB thật => không có dữ liệu nào được
 *             tạo / thay đổi => KHÔNG cần rollback sau khi chạy test.
 *
 * Ghi chú lỗ hổng nghiệp vụ:
 *   - QST-001: Section ngoài [1-7] → service KHÔNG validate → lỗ hổng
 *   - QST-022: update Section=8   → service KHÔNG validate → lỗ hổng
 */

// ── Mock repository trước khi import service ───────────────────────────────
const mockQuestionRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findWithFilters: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getUsageStats: jest.fn(),
  getQuestionsBySection: jest.fn(),
  bulkDelete: jest.fn(),
};

jest.mock(
  '../infrastructure/repositories/question.repository',
  () => ({ QuestionRepository: jest.fn(() => mockQuestionRepo) })
);

import { QuestionService } from '../application/services/question.service';

// ── Helper tạo question DTO hợp lệ (Part 1) — dỹng theo CreateQuestionDto ───────
function makePart1Dto(overrides: Record<string, any> = {}) {
  const base = {
    QuestionText: 'Look at the picture.',
    Media: {
      Skill: 'LISTENING',
      Section: '1',
      AudioUrl: 'https://cdn.example.com/audio.mp3',
      ImageUrl: 'https://cdn.example.com/img.jpg',
      Type: 'Part1',
    },
    Choices: [
      { Attribute: 'A', Content: 'A man is sitting', IsCorrect: true },
      { Attribute: 'B', Content: 'A woman is standing', IsCorrect: false },
    ],
  };
  // Allow overriding nested Media fields
  if (overrides.Media) {
    base.Media = { ...base.Media, ...overrides.Media };
    delete overrides.Media;
  }
  return { ...base, ...overrides };
}

function makeQuestion(overrides: Record<string, any> = {}) {
  return {
    ID: 100,
    QuestionText: 'Look at the picture.',
    mediaQuestion: {
      Skill: 'LISTENING',
      Type: 'Part1',
      Section: '1',
      AudioUrl: 'https://cdn.example.com/audio.mp3',
      ImageUrl: 'https://cdn.example.com/img.jpg',
      Scirpt: null,
    },
    choices: [
      { ID: 10, Attribute: 'A', Content: 'A man is sitting', IsCorrect: true },
      { ID: 11, Attribute: 'B', Content: 'A woman is standing', IsCorrect: false },
    ],
    ...overrides,
  };
}

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('QuestionService', () => {
  let service: QuestionService;

  // Reset tất cả mock trước mỗi test để tránh ảnh hưởng lẫn nhau
  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestionService();
  });

  // ── createQuestion() ──────────────────────────────────────────────────────
  describe('createQuestion()', () => {

    // TC-TRINH-QST-001 [LỖ HỔNG NGHIỆP VỤ]
    it('TC-TRINH-QST-001 — [LỖ HỔNG] Section=9 ngoài [1-7] nhưng service KHÔNG validate → tạo thành công', async () => {
      // Arrange — Section=9 không hợp lệ theo nghiệp vụ TOEIC (chỉ có Part 1-7)
      //           Expected: throw lỗi. Actual: tạo thành công (lỗ hổng)
      mockQuestionRepo.create.mockResolvedValue(makeQuestion({ Section: 9 }));

      // Act — service KHÔNG throw dù Section không hợp lệ
      const result = await service.createQuestion(
        makePart1Dto({ Media: { Section: '9' } }) as any, 1
      );

      // Assert — test xác nhận lỗ hổng: create được gọi dù Section không hợp lệ
      expect(result).toBeDefined();

      // CheckDB — create được gọi (đây là hành vi SAI, cần fix)
      expect(mockQuestionRepo.create).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-QST-002
    it('TC-TRINH-QST-002 — Throw lỗi khi Part 1 thiếu ImageUrl', async () => {
      // Arrange — Part 1 bắt buộc phải có ImageUrl theo nghiệp vụ TOEIC
      const dto = makePart1Dto({ Media: { ImageUrl: undefined } });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/image/i);

      // CheckDB — create KHÔNG được gọi vì bị chặn bởi validation
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-003
    it('TC-TRINH-QST-003 — Throw lỗi khi LISTENING question thiếu AudioUrl', async () => {
      // Arrange — Skill=LISTENING (Part 1-4) bắt buộc phải có AudioUrl
      const dto = makePart1Dto({ Media: { AudioUrl: undefined } });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/audio/i);

      // CheckDB — create KHÔNG được gọi vì bị chặn bởi validation
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-004
    it('TC-TRINH-QST-004 — Throw lỗi khi chỉ có 1 choice (tối thiểu phải có 2)', async () => {
      // Arrange — chỉ có 1 choice không đủ điều kiện bài thi trắc nghiệm
      const dto = makePart1Dto({
        Choices: [{ Attribute: 'A', Content: 'Only option', IsCorrect: true }],
      });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/choice/i);

      // CheckDB — create KHÔNG được gọi
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-005
    it('TC-TRINH-QST-005 — Throw lỗi khi không có đáp án đúng (IsCorrect=false tất cả)', async () => {
      // Arrange — mỗi câu hỏi bắt buộc phải có đúng 1 đáp án đúng
      const dto = makePart1Dto({
        Choices: [
          { Attribute: 'A', Content: 'Wrong A', IsCorrect: false },
          { Attribute: 'B', Content: 'Wrong B', IsCorrect: false },
        ],
      });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/correct/i);

      // CheckDB — create KHÔNG được gọi
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-006
    it('TC-TRINH-QST-006 — Throw lỗi khi có 2 đáp án đúng (vi phạm single-answer)', async () => {
      // Arrange — chỉ được có đúng 1 đáp án IsCorrect=true
      const dto = makePart1Dto({
        Choices: [
          { Attribute: 'A', Content: 'Correct A', IsCorrect: true },
          { Attribute: 'B', Content: 'Correct B', IsCorrect: true },
        ],
      });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/correct/i);

      // CheckDB — create KHÔNG được gọi
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-007
    it('TC-TRINH-QST-007 — Throw lỗi khi attributes bị trùng nhau (A, A)', async () => {
      // Arrange — mỗi choice phải có Attribute duy nhất (A, B, C, D)
      const dto = makePart1Dto({
        Choices: [
          { Attribute: 'A', Content: 'First A', IsCorrect: true },
          { Attribute: 'A', Content: 'Second A', IsCorrect: false },
        ],
      });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/duplicate|attribute/i);

      // CheckDB — create KHÔNG được gọi
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-008
    it('TC-TRINH-QST-008 — Throw lỗi khi choice có nội dung rỗng', async () => {
      // Arrange — content rỗng không hợp lệ
      const dto = makePart1Dto({
        Choices: [
          { Attribute: 'A', Content: '', IsCorrect: true },
          { Attribute: 'B', Content: 'Valid', IsCorrect: false },
        ],
      });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/content|empty/i);

      // CheckDB — create KHÔNG được gọi
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-009
    it('TC-TRINH-QST-009 — Throw lỗi khi AudioUrl không bắt đầu bằng http/https', async () => {
      // Arrange — URL không hợp lệ (không phải http/https)
      const dto = makePart1Dto({ Media: { AudioUrl: 'ftp://cdn.example.com/audio.mp3' } });

      // Act & Assert
      await expect(service.createQuestion(dto as any, 1)).rejects.toThrow(/url|http/i);

      // CheckDB — create KHÔNG được gọi vì URL không hợp lệ
      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-010
    it('TC-TRINH-QST-010 — Tạo Part 1 question thành công với đủ AudioUrl + ImageUrl', async () => {
      // Arrange — đầy đủ dữ liệu hợp lệ cho Part 1
      mockQuestionRepo.create.mockResolvedValue(makeQuestion());

      // Act
      const result = await service.createQuestion(makePart1Dto() as any, 1);

      // Assert — trả về question vừa tạo
      expect(result).toBeDefined();
      expect(result.ID).toBe(100);

      // CheckDB — create được gọi đúng 1 lần
      expect(mockQuestionRepo.create).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-QST-011
    it('TC-TRINH-QST-011 — Tạo Part 5 (READING) thành công không cần AudioUrl/ImageUrl', async () => {
      // Arrange — Part 5 là READING, không yêu cầu Audio hay Image
      const dto = {
        QuestionText: 'Choose the correct word.',
        Media: { Skill: 'READING', Section: '5', Type: 'Part5' },
        Choices: [
          { Attribute: 'A', Content: 'goes', IsCorrect: true },
          { Attribute: 'B', Content: 'go', IsCorrect: false },
        ],
      };
      mockQuestionRepo.create.mockResolvedValue(makeQuestion({ Section: 5, Skill: 'READING', AudioUrl: null, ImageUrl: null }));

      // Act
      const result = await service.createQuestion(dto as any, 1);

      // Assert — tạo thành công mà không cần media
      expect(result).toBeDefined();

      // CheckDB — create được gọi đúng 1 lần
      expect(mockQuestionRepo.create).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });

  // ── getQuestionById() ─────────────────────────────────────────────────────
  describe('getQuestionById()', () => {

    // TC-TRINH-QST-012
    it('TC-TRINH-QST-012 — Throw lỗi khi questionId không tồn tại', async () => {
      // Arrange — mock trả về null (không tìm thấy)
      mockQuestionRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getQuestionById(999)).rejects.toThrow(/not found/i);

      // CheckDB — findById được gọi với id=999
      expect(mockQuestionRepo.findById).toHaveBeenCalledWith(999);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });

    // TC-TRINH-QST-013
    it('TC-TRINH-QST-013 — Trả về question đầy đủ (bao gồm IsCorrect cho admin)', async () => {
      // Arrange — question tồn tại trong DB
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());

      // Act
      const result = await service.getQuestionById(100);

      // Assert — trả về đủ thông tin
      expect(result.ID).toBe(100);
      expect(result.choices).toBeDefined();

      // CheckDB — findById được gọi đúng 1 lần với id=100
      expect(mockQuestionRepo.findById).toHaveBeenCalledWith(100);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── searchQuestions() ─────────────────────────────────────────────────────
  describe('searchQuestions()', () => {

    // TC-TRINH-QST-014
    it('TC-TRINH-QST-014 — Truyền đúng filter Skill=LISTENING, Section="1" xuống repository', async () => {
      // Arrange — mock trả về danh sách rỗng
      mockQuestionRepo.findWithFilters.mockResolvedValue({ questions: [], total: 0 });
      mockQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0 });

      // Act
      await service.searchQuestions({ Skill: 'LISTENING', Section: '1' } as any);

      // CheckDB — findWithFilters được gọi với đúng filter
      expect(mockQuestionRepo.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ Skill: 'LISTENING', Section: '1' })
      );
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });

    // TC-TRINH-QST-015
    it('TC-TRINH-QST-015 — Trả về kết quả với pagination đúng', async () => {
      // Arrange — mock 3 câu hỏi, tổng 10
      const mockQuestions = [makeQuestion({ ID: 1 }), makeQuestion({ ID: 2 }), makeQuestion({ ID: 3 })];
      mockQuestionRepo.findWithFilters.mockResolvedValue({ questions: mockQuestions, total: 10 });
      mockQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 0 });

      // Act
      const result = await service.searchQuestions({} as any);

      // Assert — kết quả trả về đúng số lượng và tổng
      expect(result.Questions).toHaveLength(3);
      expect(result.Pagination.TotalQuestions).toBe(10);

      // CheckDB — findWithFilters được gọi đúng 1 lần
      expect(mockQuestionRepo.findWithFilters).toHaveBeenCalledTimes(1);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── updateQuestion() ──────────────────────────────────────────────────────
  describe('updateQuestion()', () => {

    // TC-TRINH-QST-016
    it('TC-TRINH-QST-016 — Throw lỗi khi questionId không tồn tại', async () => {
      // Arrange — question không có trong DB
      mockQuestionRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateQuestion(999, { QuestionText: 'Updated' } as any, 1)
      ).rejects.toThrow(/not found/i);

      // CheckDB — update KHÔNG được gọi
      expect(mockQuestionRepo.update).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-017
    it('TC-TRINH-QST-017 — Cập nhật thành công khi dữ liệu hợp lệ', async () => {
      // Arrange — question tồn tại, dữ liệu cập nhật hợp lệ
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());
      mockQuestionRepo.update.mockResolvedValue(makeQuestion({ QuestionText: 'Updated text' }));

      // Act
      const result = await service.updateQuestion(100, { QuestionText: 'Updated text' } as any, 1);

      // Assert — trả về question đã cập nhật
      expect(result).toBeDefined();

      // CheckDB — update được gọi đúng 1 lần với questionId=100
      expect(mockQuestionRepo.update).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-QST-018
    it('TC-TRINH-QST-018 — Throw lỗi khi cập nhật choices không hợp lệ (0 đáp án đúng)', async () => {
      // Arrange — question tồn tại nhưng choices mới không có đáp án đúng
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());
      const updateDto = {
        Choices: [
          { Attribute: 'A', Content: 'Wrong A', IsCorrect: false },
          { Attribute: 'B', Content: 'Wrong B', IsCorrect: false },
        ],
      };

      // Act & Assert
      await expect(service.updateQuestion(100, updateDto as any, 1)).rejects.toThrow(/correct/i);

      // CheckDB — update KHÔNG được gọi vì choices không hợp lệ
      expect(mockQuestionRepo.update).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-022 [LỖ HỔNG NGHIỆP VỤ]
    it('TC-TRINH-QST-022 — [LỖ HỔNG] Cập nhật Section=8 ngoài [1-7] nhưng service KHÔNG validate', async () => {
      // Arrange — Section=8 không hợp lệ theo TOEIC (chỉ có Part 1-7)
      //           Expected: throw lỗi. Actual: cập nhật thành công (lỗ hổng)
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());
      mockQuestionRepo.update.mockResolvedValue(makeQuestion({ Section: 8 }));

      // Act — service KHÔNG throw dù Section=8 không hợp lệ
      const result = await service.updateQuestion(100, { Section: 8 } as any, 1);

      // Assert — xác nhận lỗ hổng: cập nhật thành công với Section không hợp lệ
      expect(result).toBeDefined();

      // CheckDB — update được gọi (đây là hành vi SAI, cần fix)
      expect(mockQuestionRepo.update).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });

  // ── deleteQuestion() ──────────────────────────────────────────────────────
  describe('deleteQuestion()', () => {

    // TC-TRINH-QST-019
    it('TC-TRINH-QST-019 — Throw lỗi khi questionId không tồn tại', async () => {
      // Arrange — question không có trong DB
      mockQuestionRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteQuestion(999, 1)).rejects.toThrow(/not found/i);

      // CheckDB — delete KHÔNG được gọi
      expect(mockQuestionRepo.delete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-020
    it('TC-TRINH-QST-020 — Từ chối xóa khi question đang được dùng trong đề thi', async () => {
      // Arrange — usageCount=3 có nghĩa là question đang được dùng trong 3 đề thi
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());
      mockQuestionRepo.getUsageStats.mockResolvedValue({ usedInExams: 3 });

      // Act & Assert — service throw với message giải thích số đề thi đang dùng
      await expect(service.deleteQuestion(100, 1)).rejects.toThrow(/Cannot delete question that is used/i);

      // CheckDB — delete KHÔNG được gọi vì question đang được dùng
      expect(mockQuestionRepo.delete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-021
    it('TC-TRINH-QST-021 — Xóa thành công khi question chưa được dùng trong đề thi nào', async () => {
      // Arrange — usageCount=0 có nghĩa là question chưa được dùng
      mockQuestionRepo.findById.mockResolvedValue(makeQuestion());
      mockQuestionRepo.getUsageStats.mockResolvedValue({ usageCount: 0 });
      mockQuestionRepo.delete.mockResolvedValue(true);

      // Act
      const result = await service.deleteQuestion(100, 1);

      // Assert — xóa thành công
      expect(result).toBe(true);

      // CheckDB — delete được gọi đúng 1 lần với questionId=100
      expect(mockQuestionRepo.delete).toHaveBeenCalledWith(100);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });

  // ── getQuestionsBySection() ───────────────────────────────────────────────
  describe('getQuestionsBySection()', () => {

    // TC-TRINH-QST-023
    it('TC-TRINH-QST-023 — Throw lỗi khi sections rỗng', async () => {
      // Arrange — không truyền section nào
      // Act & Assert
      await expect(service.getQuestionsBySection([], 10)).rejects.toThrow(/section/i);

      // CheckDB — getQuestionsBySection KHÔNG được gọi
      expect(mockQuestionRepo.getQuestionsBySection).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-024
    it('TC-TRINH-QST-024 — Gọi repo với đúng sections=["1","3"] và limit=5', async () => {
      // Arrange — mock trả về danh sách câu hỏi
      mockQuestionRepo.getQuestionsBySection.mockResolvedValue([makeQuestion()]);

      // Act
      await service.getQuestionsBySection(['1', '3'], 5);

      // CheckDB — getQuestionsBySection được gọi với đúng sections và limit
      expect(mockQuestionRepo.getQuestionsBySection).toHaveBeenCalledWith(['1', '3'], 5);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── performBulkOperation() ────────────────────────────────────────────────
  describe('performBulkOperation()', () => {

    // TC-TRINH-QST-025
    it('TC-TRINH-QST-025 — Bulk DELETE thành công và trả về số câu đã xóa', async () => {
      // Arrange — mock bulkDelete trả về số câu xóa thành công
      mockQuestionRepo.bulkDelete.mockResolvedValue(3);

      // Act
      const result = await service.performBulkOperation(
        { Operation: 'DELETE', QuestionIDs: [1, 2, 3] } as any, 1
      );

      // Assert — trả về số câu đã xóa = 3
      expect(result.success).toBe(3);

      // CheckDB — bulkDelete được gọi đúng 1 lần với [1, 2, 3]
      expect(mockQuestionRepo.bulkDelete).toHaveBeenCalledWith([1, 2, 3]);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-QST-026
    it('TC-TRINH-QST-026 — ADD_TO_EXAM trả về lỗi "should be handled by ExamService"', async () => {
      // Arrange — ADD_TO_EXAM không phải responsibility của QuestionService
      // Act
      const result = await service.performBulkOperation(
        { Operation: 'ADD_TO_EXAM', QuestionIDs: [1, 2] } as any, 1
      );

      // Assert — trả về thông báo chỉ sang ExamService
      expect(result.errors[0]).toMatch(/ExamService/i);

      // CheckDB — bulkDelete KHÔNG được gọi
      expect(mockQuestionRepo.bulkDelete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-QST-027
    it('TC-TRINH-QST-027 — Operation không hợp lệ trả về lỗi "Unknown operation"', async () => {
      // Arrange — INVALID_OP không được định nghĩa trong service
      // Act
      const result = await service.performBulkOperation(
        { Operation: 'INVALID_OP', QuestionIDs: [1] } as any, 1
      );

      // Assert — trả về lỗi unknown operation
      expect(result.errors[0]).toMatch(/Unknown operation/i);

      // CheckDB — không có thao tác DB nào được gọi
      expect(mockQuestionRepo.bulkDelete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });
  });
});
