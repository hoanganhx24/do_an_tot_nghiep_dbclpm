/**
 * Unit Test — AttemptService
 * File gốc  : src/application/services/attempt.service.ts
 * Test file : src/__tests__/attempt.service.test.ts
 * Người PT  : Trịnh Quang Hiếu
 * Test Cases: TC-TRINH-ATT-001 → TC-TRINH-ATT-022
 *
 * Rollback  : Toàn bộ test dùng jest.mock() để mock AttemptRepository
 *             và ExamRepository, không kết nối DB thật => không có dữ
 *             liệu nào được tạo / thay đổi => KHÔNG cần rollback sau
 *             khi chạy test.
 */

// ── Mock repositories trước khi import service ─────────────────────────────
const mockAttemptRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  submitAnswers: jest.fn(),
  findByStudentId: jest.fn(),
  getBestScore: jest.fn(),
  getProgressStats: jest.fn(),
  delete: jest.fn(),
};

const mockExamRepo = {
  findById: jest.fn(),
};

jest.mock(
  '../infrastructure/repositories/attempt.repository',
  () => ({ AttemptRepository: jest.fn(() => mockAttemptRepo) })
);
jest.mock(
  '../infrastructure/repositories/exam.repository',
  () => ({ ExamRepository: jest.fn(() => mockExamRepo) })
);

import { AttemptService } from '../application/services/attempt.service';

// ── Helper tạo attempt object mẫu ─────────────────────────────────────────
function makeAttempt(overrides: Record<string, any> = {}) {
  return {
    ID: 500,
    StudentProfileID: 20,
    ExamID: 1,
    Type: 'FULL_TEST',
    ScorePercent: null,
    ScoreListening: null,
    ScoreReading: null,
    StartedAt: new Date(Date.now() - 30 * 60_000), // 30 phút trước
    SubmittedAt: null,
    exam: { ID: 1, Title: 'TOEIC Full Test 2024', TimeExam: 120 },
    attemptAnswers: [],
    ...overrides,
  };
}

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('AttemptService', () => {
  let service: AttemptService;

  // Reset tất cả mock trước mỗi test để tránh ảnh hưởng lẫn nhau
  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttemptService();
  });

  // ── startAttempt() ────────────────────────────────────────────────────────
  describe('startAttempt()', () => {

    // TC-TRINH-ATT-001
    it('TC-TRINH-ATT-001 — Throw lỗi khi ExamID không tồn tại', async () => {
      // Arrange — mock examRepo.findById trả về null (exam không tồn tại)
      mockExamRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.startAttempt({ ExamID: 1, Type: 'FULL_TEST' } as any, 20)
      ).rejects.toThrow('Exam not found');

      // CheckDB — attemptRepo.create KHÔNG được gọi vì bị chặn sớm
      expect(mockAttemptRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-002
    it('TC-TRINH-ATT-002 — Throw lỗi khi PRACTICE_BY_PART nhưng Parts rỗng', async () => {
      // Arrange — exam tồn tại nhưng Parts truyền vào là mảng rỗng
      mockExamRepo.findById.mockResolvedValue({ ID: 1, TimeExam: 120 });

      // Act & Assert
      await expect(
        service.startAttempt({ ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [] } as any, 20)
      ).rejects.toThrow('Parts must be specified for practice by part mode');

      // CheckDB — create KHÔNG được gọi vì validation chặn trước
      expect(mockAttemptRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-003
    it('TC-TRINH-ATT-003 — Throw lỗi khi Parts chứa giá trị ngoài [1-7]', async () => {
      // Arrange — Parts=[0, 8] không hợp lệ theo nghiệp vụ TOEIC
      mockExamRepo.findById.mockResolvedValue({ ID: 1, TimeExam: 120 });

      // Act & Assert
      await expect(
        service.startAttempt({ ExamID: 1, Type: 'PRACTICE_BY_PART', Parts: [0, 8] } as any, 20)
      ).rejects.toThrow(/Invalid part numbers: 0, 8/);

      // CheckDB — create KHÔNG được gọi
      expect(mockAttemptRepo.create).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-004
    it('TC-TRINH-ATT-004 — Tạo FULL_TEST thành công, Score khởi tạo là null', async () => {
      // Arrange — exam hợp lệ, mock create trả về attempt mới
      mockExamRepo.findById.mockResolvedValue({ ID: 1, TimeExam: 120 });
      const mockCreated = makeAttempt({ ID: 999, Type: 'FULL_TEST' });
      mockAttemptRepo.create.mockResolvedValue(mockCreated);

      // Act
      const result = await service.startAttempt({ ExamID: 1, Type: 'FULL_TEST' } as any, 20);

      // Assert — attempt được tạo với Score=null (chưa làm bài)
      expect(result.ID).toBe(999);

      // CheckDB — create được gọi đúng 1 lần với ScorePercent=null
      expect(mockAttemptRepo.create).toHaveBeenCalledTimes(1);
      const arg = mockAttemptRepo.create.mock.calls[0][0];
      expect(arg.ScorePercent).toBeNull();
      expect(arg.ScoreListening).toBeNull();
      expect(arg.ScoreReading).toBeNull();
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-ATT-005
    it('TC-TRINH-ATT-005 — Tạo PRACTICE_BY_PART thành công với Parts=[1,3,5]', async () => {
      // Arrange — Parts hợp lệ (tất cả trong [1-7])
      mockExamRepo.findById.mockResolvedValue({ ID: 2, TimeExam: 60 });
      mockAttemptRepo.create.mockResolvedValue(makeAttempt({ ID: 1001, Type: 'PRACTICE_BY_PART' }));

      // Act
      const result = await service.startAttempt(
        { ExamID: 2, Type: 'PRACTICE_BY_PART', Parts: [1, 3, 5] } as any, 20
      );

      // Assert
      expect(result.ID).toBe(1001);

      // CheckDB — create được gọi đúng 1 lần
      expect(mockAttemptRepo.create).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });

  // ── submitAttempt() ───────────────────────────────────────────────────────
  describe('submitAttempt()', () => {

    // TC-TRINH-ATT-006
    it('TC-TRINH-ATT-006 — Throw lỗi khi AttemptID không tồn tại', async () => {
      // Arrange — attempt không có trong DB
      mockAttemptRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.submitAttempt({ AttemptID: 1, answers: [] } as any, 20)
      ).rejects.toThrow('Attempt not found');

      // CheckDB — submitAnswers KHÔNG được gọi
      expect(mockAttemptRepo.submitAnswers).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-007
    it('TC-TRINH-ATT-007 — Từ chối nộp khi attempt thuộc về học sinh khác', async () => {
      // Arrange — attempt có StudentProfileID=99 khác với userId=20
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({ StudentProfileID: 99 }));

      // Act & Assert
      await expect(
        service.submitAttempt({ AttemptID: 500, answers: [] } as any, 20)
      ).rejects.toThrow('You can only submit your own attempts');

      // CheckDB — submitAnswers KHÔNG được gọi
      expect(mockAttemptRepo.submitAnswers).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-008
    it('TC-TRINH-ATT-008 — Từ chối nộp khi attempt đã được nộp trước đó', async () => {
      // Arrange — SubmittedAt đã có giá trị (đã nộp rồi)
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({ SubmittedAt: new Date() }));

      // Act & Assert
      await expect(
        service.submitAttempt({ AttemptID: 500, answers: [] } as any, 20)
      ).rejects.toThrow('This attempt has already been submitted');

      // CheckDB — submitAnswers KHÔNG được gọi
      expect(mockAttemptRepo.submitAnswers).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-009
    it('TC-TRINH-ATT-009 — Từ chối nộp khi vượt quá thời gian cho phép', async () => {
      // Arrange — bắt đầu 150 phút trước, TimeExam=60 → đã quá giờ 90 phút
      const startedAt = new Date(Date.now() - 150 * 60_000);
      mockAttemptRepo.findById.mockResolvedValue(
        makeAttempt({ StartedAt: startedAt, exam: { TimeExam: 60 } })
      );

      // Act & Assert
      await expect(
        service.submitAttempt({ AttemptID: 500, answers: [] } as any, 20)
      ).rejects.toThrow(/Time limit exceeded/);

      // CheckDB — submitAnswers KHÔNG được gọi vì vượt giờ
      expect(mockAttemptRepo.submitAnswers).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-010
    it('TC-TRINH-ATT-010 — Throw lỗi khi grading trả về null', async () => {
      // Arrange — submitAnswers mock trả về null (chấm điểm thất bại)
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt());
      mockAttemptRepo.submitAnswers.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.submitAttempt({ AttemptID: 500, answers: [] } as any, 20)
      ).rejects.toThrow('Failed to grade attempt');

      // CheckDB — submitAnswers được gọi nhưng trả về null → service throw trước khi commit
      // Rollback: mock trả về null → không có data thật nào bị ghi
    });

    // TC-TRINH-ATT-011
    it('TC-TRINH-ATT-011 — Nộp bài thành công, trả về điểm đầy đủ', async () => {
      // Arrange — attempt hợp lệ, chấm điểm trả về kết quả đầy đủ
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt());
      const gradedAttempt = makeAttempt({
        SubmittedAt: new Date(),
        ScorePercent: 80, ScoreListening: 400, ScoreReading: 400,
        attemptAnswers: [{
          IsCorrect: true,
          question: {
            ID: 1, QuestionText: 'Q1',
            mediaQuestion: { Type: 'Part5', Section: '5', Skill: 'READING', AudioUrl: null, ImageUrl: null, Scirpt: null },
            choices: [{ ID: 10, Attribute: 'A', Content: 'goes', IsCorrect: true }],
          },
          choice: { ID: 10, Attribute: 'A', Content: 'goes' },
        }],
        exam: { ID: 1, Title: 'TOEIC Full Test 2024', TimeExam: 120 },
      });
      mockAttemptRepo.submitAnswers.mockResolvedValue(gradedAttempt);

      // Act
      const result = await service.submitAttempt(
        { AttemptID: 500, answers: [{ QuestionID: 1, ChoiceID: 10 }] } as any, 20
      );

      // Assert — tổng điểm = Listening + Reading = 800
      expect(result.Scores.ScoreListening).toBe(400);
      expect(result.Scores.ScoreReading).toBe(400);
      expect(result.Scores.TotalScore).toBe(800);

      // CheckDB — submitAnswers được gọi đúng 1 lần → attempt được ghi nhận đã nộp
      expect(mockAttemptRepo.submitAnswers).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });

    // TC-TRINH-ATT-012
    it('TC-TRINH-ATT-012 — Xác định điểm yếu khi accuracy theo type < 60%', async () => {
      // Arrange — 2 câu Part5, cả 2 đều sai → accuracy = 0% < 60%
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt());
      const answers = Array.from({ length: 2 }, (_, i) => ({
        IsCorrect: false,
        question: {
          ID: i + 1, QuestionText: `Q${i + 1}`,
          mediaQuestion: { Type: 'Part5', Section: '5', Skill: 'READING', AudioUrl: null, ImageUrl: null, Scirpt: null },
          choices: [{ ID: 10, Attribute: 'A', Content: 'goes', IsCorrect: true }],
        },
        choice: { ID: 11, Attribute: 'B', Content: 'go' },
      }));
      mockAttemptRepo.submitAnswers.mockResolvedValue(makeAttempt({
        SubmittedAt: new Date(), ScorePercent: 0, ScoreListening: 0, ScoreReading: 0,
        attemptAnswers: answers,
        exam: { ID: 1, Title: 'TOEIC Test', TimeExam: 120 },
      }));

      // Act
      const result = await service.submitAttempt({ AttemptID: 500, answers: [] } as any, 20);

      // Assert — WeakAreas phải chứa 'Part5'
      expect(result.Analysis.WeakAreas.length).toBeGreaterThan(0);
      expect(result.Analysis.WeakAreas[0]).toMatch(/Part5/);

      // CheckDB — submitAnswers được gọi đúng 1 lần
      expect(mockAttemptRepo.submitAnswers).toHaveBeenCalledTimes(1);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });

  // ── getAttemptResults() ───────────────────────────────────────────────────
  describe('getAttemptResults()', () => {

    // TC-TRINH-ATT-013
    it('TC-TRINH-ATT-013 — Throw lỗi khi AttemptID không tồn tại', async () => {
      // Arrange — attempt không có trong DB
      mockAttemptRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getAttemptResults(88, 20)).rejects.toThrow('Attempt not found');

      // CheckDB — findById được gọi, không có thao tác ghi nào
      // Rollback: không ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-014
    it('TC-TRINH-ATT-014 — Từ chối truy cập khi attempt thuộc về học sinh khác', async () => {
      // Arrange — StudentProfileID=99 khác userId=20
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({ StudentProfileID: 99 }));

      // Act & Assert
      await expect(service.getAttemptResults(88, 20)).rejects.toThrow(
        'You can only view your own attempt results'
      );

      // CheckDB — findById được gọi, không có thao tác ghi nào
      // Rollback: không ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-015
    it('TC-TRINH-ATT-015 — Từ chối xem khi attempt chưa được nộp', async () => {
      // Arrange — SubmittedAt=null (chưa nộp)
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({ SubmittedAt: null }));

      // Act & Assert
      await expect(service.getAttemptResults(88, 20)).rejects.toThrow(
        'This attempt has not been submitted yet'
      );

      // CheckDB — findById được gọi, không có thao tác ghi nào
      // Rollback: không ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-016
    it('TC-TRINH-ATT-016 — Trả về kết quả với timeTaken tính đúng (~90 phút)', async () => {
      // Arrange — bắt đầu 90 phút trước, đã nộp
      const startedAt = new Date(Date.now() - 90 * 60_000);
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({
        ID: 500, StudentProfileID: 20,
        StartedAt: startedAt, SubmittedAt: new Date(),
        ScorePercent: 75, ScoreListening: 350, ScoreReading: 400,
        attemptAnswers: [],
        exam: { ID: 1, Title: 'TOEIC Test', TimeExam: 120 },
      }));

      // Act
      const result = await service.getAttemptResults(500, 20);

      // Assert — TimeTaken ~90 phút, sai số ±1 phút
      expect(result.TimeTaken).toBeGreaterThanOrEqual(89);
      expect(result.TimeTaken).toBeLessThanOrEqual(91);
      expect(result.AttemptID).toBe(500);

      // CheckDB — findById được gọi đúng 1 lần (chỉ đọc, không ghi)
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── getStudentAttempts() ──────────────────────────────────────────────────
  describe('getStudentAttempts()', () => {

    // TC-TRINH-ATT-017
    it('TC-TRINH-ATT-017 — Truyền đúng filters xuống repository', async () => {
      // Arrange — mock trả về danh sách rỗng
      mockAttemptRepo.findByStudentId.mockResolvedValue([]);

      // Act
      await service.getStudentAttempts(20, { Type: 'FULL_TEST' } as any);

      // Assert & CheckDB — findByStudentId được gọi với đúng studentId và filter
      expect(mockAttemptRepo.findByStudentId).toHaveBeenCalledWith(20, { Type: 'FULL_TEST' });
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── getBestScore() ────────────────────────────────────────────────────────
  describe('getBestScore()', () => {

    // TC-TRINH-ATT-018
    it('TC-TRINH-ATT-018 — Gọi repository với đúng (studentId=20, examId=900)', async () => {
      // Arrange — mock trả về attempt có điểm cao nhất
      mockAttemptRepo.getBestScore.mockResolvedValue({ ID: 77, ScorePercent: 85 });

      // Act
      const result = await service.getBestScore(20, 900);

      // Assert
      expect(result).not.toBeNull();

      // CheckDB — getBestScore được gọi đúng 1 lần với (studentId=20, examId=900)
      expect(mockAttemptRepo.getBestScore).toHaveBeenCalledWith(20, 900);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── getProgressStatistics() ───────────────────────────────────────────────
  describe('getProgressStatistics()', () => {

    // TC-TRINH-ATT-019
    it('TC-TRINH-ATT-019 — Trả về thống kê tiến độ cho học sinh', async () => {
      // Arrange — mock dữ liệu thống kê
      const stats = { totalAttempts: 10, averageScore: 72, trend: 'UP' };
      mockAttemptRepo.getProgressStats.mockResolvedValue(stats);

      // Act
      const result = await service.getProgressStatistics(20);

      // Assert
      expect(result.totalAttempts).toBe(10);

      // CheckDB — getProgressStats được gọi đúng 1 lần với studentId=20
      expect(mockAttemptRepo.getProgressStats).toHaveBeenCalledWith(20);
      // Rollback: chỉ đọc dữ liệu → không cần rollback
    });
  });

  // ── deleteAttempt() ───────────────────────────────────────────────────────
  describe('deleteAttempt()', () => {

    // TC-TRINH-ATT-020
    it('TC-TRINH-ATT-020 — Throw lỗi khi AttemptID không tồn tại', async () => {
      // Arrange — attempt không có trong DB
      mockAttemptRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteAttempt(500, 20)).rejects.toThrow('Attempt not found');

      // CheckDB — delete KHÔNG được gọi vì attempt không tồn tại
      expect(mockAttemptRepo.delete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-021
    it('TC-TRINH-ATT-021 — Từ chối xóa khi attempt không thuộc về học sinh', async () => {
      // Arrange — StudentProfileID=99 khác userId=20
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt({ StudentProfileID: 99 }));

      // Act & Assert
      await expect(service.deleteAttempt(500, 20)).rejects.toThrow(
        'You can only delete your own attempts'
      );

      // CheckDB — delete KHÔNG được gọi vì không có quyền
      expect(mockAttemptRepo.delete).not.toHaveBeenCalled();
      // Rollback: không có ghi DB → không cần rollback
    });

    // TC-TRINH-ATT-022
    it('TC-TRINH-ATT-022 — Xóa thành công và trả về true', async () => {
      // Arrange — attempt hợp lệ, thuộc về học sinh đúng
      mockAttemptRepo.findById.mockResolvedValue(makeAttempt());
      mockAttemptRepo.delete.mockResolvedValue(true);

      // Act
      const result = await service.deleteAttempt(500, 20);

      // Assert
      expect(result).toBe(true);

      // CheckDB — delete được gọi đúng 1 lần với attemptId=500 → record bị xóa
      expect(mockAttemptRepo.delete).toHaveBeenCalledWith(500);
      // Rollback: jest.clearAllMocks() trong beforeEach reset mock sau test
    });
  });
});
