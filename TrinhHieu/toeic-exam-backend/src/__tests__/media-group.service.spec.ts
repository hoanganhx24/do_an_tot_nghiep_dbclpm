/**
 * Unit Tests for QuestionService
 * File gốc  : src/application/services/question.service.ts
 * Test file : src/application/services/__tests__/question.service.spec.ts
 * Test Cases: TC-QST-001 → TC-QST-040
 *
 * Rollback: Toàn bộ dependencies được mock bằng jest.mock() → không có dữ liệu thật
 * nào được ghi/xóa. Không cần rollback sau mỗi test.
 */

// ─── Mock repository trước khi import service ────────────────────────────────
const mockQuestionRepository = {
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
    () => ({
        QuestionRepository: jest.fn().mockImplementation(() => mockQuestionRepository),
    }),
);

import { QuestionService } from '../application/services/question.service';

// ─── Setup ───────────────────────────────────────────────────────────────────
let service: QuestionService;

beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestionService();
});

// ─── Helper factories ─────────────────────────────────────────────────────────
const makeQuestion = (overrides: any = {}) => ({
    ID: 1,
    QuestionText: 'What does the man do?',
    UserID: 1,
    MediaQuestionID: 1,
    mediaQuestion: {
        ID: 1,
        Skill: 'LISTENING',
        Type: 'MULTIPLE_CHOICE',
        Section: '3',
        AudioUrl: 'https://cdn.test/audio.mp3',
        ImageUrl: undefined,
        Script: undefined,
    },
    choices: [
        { ID: 1, Attribute: 'A', Content: 'He is reading.', IsCorrect: true },
        { ID: 2, Attribute: 'B', Content: 'He is writing.', IsCorrect: false },
        { ID: 3, Attribute: 'C', Content: 'He is running.', IsCorrect: false },
        { ID: 4, Attribute: 'D', Content: 'He is sleeping.', IsCorrect: false },
    ],
    ...overrides,
});

const makeCreateDto = (overrides: any = {}) => ({
    QuestionText: 'Sample Question?',
    Media: {
        Skill: 'LISTENING',
        Type: 'MULTIPLE_CHOICE',
        Section: '3',
        AudioUrl: 'https://cdn.test/audio.mp3',
        ImageUrl: undefined,
        Script: undefined,
    },
    Choices: [
        { Content: 'A answer', Attribute: 'A', IsCorrect: true },
        { Content: 'B answer', Attribute: 'B', IsCorrect: false },
        { Content: 'C answer', Attribute: 'C', IsCorrect: false },
        { Content: 'D answer', Attribute: 'D', IsCorrect: false },
    ],
    ...overrides,
});

const makeUsageStats = (overrides = {}) => ({
    usedInExams: 0,
    totalAttempts: 0,
    ...overrides,
});

// ═══════════════════════════════════════════════════════════════════════════════
// createQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('createQuestion()', () => {
    // TC-QST-001
    it('TC-QST-001 - Tạo question thành công với dữ liệu hợp lệ (LISTENING + AudioUrl)', async () => {
        const created = makeQuestion();
        mockQuestionRepository.create.mockResolvedValue(created);

        const result = await service.createQuestion(makeCreateDto(), 1);

        expect(mockQuestionRepository.create).toHaveBeenCalledTimes(1);
        expect(mockQuestionRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ QuestionText: 'Sample Question?', UserID: 1 }),
            expect.objectContaining({ Skill: 'LISTENING', AudioUrl: 'https://cdn.test/audio.mp3' }),
            expect.arrayContaining([expect.objectContaining({ IsCorrect: true })]),
        );
        expect(result).toEqual(created);
    });

    // TC-QST-002
    it('TC-QST-002 - Throw lỗi khi LISTENING question thiếu AudioUrl', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'LISTENING',
                Type: 'MULTIPLE_CHOICE',
                Section: '3',
                AudioUrl: undefined,
                ImageUrl: undefined,
                Script: undefined,
            },
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Listening questions must have audio URL',
        );
        expect(mockQuestionRepository.create).not.toHaveBeenCalled();
    });

    // TC-QST-003
    it('TC-QST-003 - Throw lỗi khi Part 1 (Section="1") không có ImageUrl', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'LISTENING',
                Type: 'PHOTO',
                Section: '1',
                AudioUrl: 'https://cdn.test/audio.mp3',
                ImageUrl: undefined,
                Script: undefined,
            },
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Part 1 questions must have an image',
        );
        expect(mockQuestionRepository.create).not.toHaveBeenCalled();
    });

    // TC-QST-004
    it('TC-QST-004 - Throw lỗi khi AudioUrl có format không hợp lệ', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'LISTENING',
                Type: 'MULTIPLE_CHOICE',
                Section: '3',
                AudioUrl: 'ftp://invalid.url/audio.mp3',
                ImageUrl: undefined,
                Script: undefined,
            },
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow('Invalid audio URL format');
        expect(mockQuestionRepository.create).not.toHaveBeenCalled();
    });

    // TC-QST-005
    it('TC-QST-005 - Throw lỗi khi ImageUrl có format không hợp lệ', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'READING',
                Type: 'MULTIPLE_CHOICE',
                Section: '5',
                AudioUrl: undefined,
                ImageUrl: 'invalid-url',
                Script: undefined,
            },
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow('Invalid image URL format');
    });

    // TC-QST-006
    it('TC-QST-006 - Throw lỗi khi choices có ít hơn 2 phần tử', async () => {
        const dto = makeCreateDto({
            Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Question must have at least 2 choices',
        );
        expect(mockQuestionRepository.create).not.toHaveBeenCalled();
    });

    // TC-QST-007
    it('TC-QST-007 - Throw lỗi khi không có đáp án đúng nào (0 correct)', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: false },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Question must have exactly one correct answer',
        );
    });

    // TC-QST-008
    it('TC-QST-008 - Throw lỗi khi có 2 đáp án đúng', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: true },
            ],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Question must have exactly one correct answer',
        );
    });

    // TC-QST-009
    it('TC-QST-009 - Throw lỗi khi attributes của choices bị trùng', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: 'A answer', Attribute: 'A', IsCorrect: true },
                { Content: 'B answer', Attribute: 'A', IsCorrect: false }, // trùng attribute 'A'
            ],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow(
            'Choice attributes must be unique',
        );
    });

    // TC-QST-010
    it('TC-QST-010 - Throw lỗi khi choice có content rỗng (empty string)', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: '', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow('All choices must have content');
    });

    // TC-QST-011
    it('TC-QST-011 - Throw lỗi khi choice có content chỉ là whitespace', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: '   ', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, 1)).rejects.toThrow('All choices must have content');
    });

    // TC-QST-012
    it('TC-QST-012 - Tạo thành công READING question không cần AudioUrl', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'READING',
                Type: 'MULTIPLE_CHOICE',
                Section: '5',
                AudioUrl: undefined,
                ImageUrl: undefined,
                Script: undefined,
            },
        });
        mockQuestionRepository.create.mockResolvedValue(makeQuestion());

        const result = await service.createQuestion(dto, 1);

        expect(result).toBeDefined();
        expect(mockQuestionRepository.create).toHaveBeenCalledTimes(1);
    });

    // TC-QST-013
    it('TC-QST-013 - Tạo thành công Part 1 khi có đủ AudioUrl và ImageUrl', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'LISTENING',
                Type: 'PHOTO',
                Section: '1',
                AudioUrl: 'https://cdn.test/audio.mp3',
                ImageUrl: 'https://cdn.test/image.jpg',
                Script: undefined,
            },
        });
        mockQuestionRepository.create.mockResolvedValue(makeQuestion());

        const result = await service.createQuestion(dto, 1);

        expect(result).toBeDefined();
        expect(mockQuestionRepository.create).toHaveBeenCalledTimes(1);
    });

    // TC-QST-014
    it('TC-QST-014 - Chấp nhận relative URL path (bắt đầu bằng /)', async () => {
        const dto = makeCreateDto({
            Media: {
                Skill: 'LISTENING',
                Type: 'MULTIPLE_CHOICE',
                Section: '3',
                AudioUrl: '/uploads/audio/test.mp3',
                ImageUrl: undefined,
                Script: undefined,
            },
        });
        mockQuestionRepository.create.mockResolvedValue(makeQuestion());

        await expect(service.createQuestion(dto, 1)).resolves.toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getQuestionById()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getQuestionById()', () => {
    // TC-QST-015
    it('TC-QST-015 - Trả về question khi ID tồn tại', async () => {
        const q = makeQuestion();
        mockQuestionRepository.findById.mockResolvedValue(q);

        const result = await service.getQuestionById(1);

        expect(result).toEqual(q);
        expect(mockQuestionRepository.findById).toHaveBeenCalledWith(1);
    });

    // TC-QST-016
    it('TC-QST-016 - Throw "Question not found" khi ID không tồn tại', async () => {
        mockQuestionRepository.findById.mockResolvedValue(null);

        await expect(service.getQuestionById(9999)).rejects.toThrow('Question not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// searchQuestions()
// ═══════════════════════════════════════════════════════════════════════════════
describe('searchQuestions()', () => {
    // TC-QST-017
    it('TC-QST-017 - Trả về paginated questions với metadata đúng', async () => {
        const questions = [makeQuestion(), makeQuestion({ ID: 2 })];
        mockQuestionRepository.findWithFilters.mockResolvedValue({
            questions,
            total: 2,
        });
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());

        const result = await service.searchQuestions({ Page: 1, Limit: 10 });

        expect(result.Questions).toHaveLength(2);
        expect(result.Pagination.TotalQuestions).toBe(2);
        expect(result.Pagination.CurrentPage).toBe(1);
        expect(result.Pagination.TotalPages).toBe(1);
    });

    // TC-QST-018
    it('TC-QST-018 - Trả về danh sách rỗng khi không có question nào match', async () => {
        mockQuestionRepository.findWithFilters.mockResolvedValue({ questions: [], total: 0 });

        const result = await service.searchQuestions({ SearchText: 'notfound' });

        expect(result.Questions).toHaveLength(0);
        expect(result.Pagination.TotalQuestions).toBe(0);
    });

    // TC-QST-019
    it('TC-QST-019 - TotalPages được tính đúng với ceil (51 items, limit 10 → 6 pages)', async () => {
        const questions = Array.from({ length: 10 }, (_, i) => makeQuestion({ ID: i + 1 }));
        mockQuestionRepository.findWithFilters.mockResolvedValue({ questions, total: 51 });
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());

        const result = await service.searchQuestions({ Page: 1, Limit: 10 });

        expect(result.Pagination.TotalPages).toBe(6);
    });

    // TC-QST-020
    it('TC-QST-020 - Truyền filters đúng sang repository (Skill, Section, SearchText)', async () => {
        mockQuestionRepository.findWithFilters.mockResolvedValue({ questions: [], total: 0 });

        await service.searchQuestions({ Skill: 'READING', Section: '5', SearchText: 'grammar' });

        expect(mockQuestionRepository.findWithFilters).toHaveBeenCalledWith(
            expect.objectContaining({ Skill: 'READING', Section: '5', SearchText: 'grammar' }),
        );
    });

    // TC-QST-021
    it('TC-QST-021 - UsageCount được include trong mỗi question response', async () => {
        mockQuestionRepository.findWithFilters.mockResolvedValue({
            questions: [makeQuestion()],
            total: 1,
        });
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats({ usedInExams: 7 }));

        const result = await service.searchQuestions({});

        expect(result.Questions[0].UsageCount).toBe(7);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// updateQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('updateQuestion()', () => {
    // TC-QST-022
    it('TC-QST-022 - Update QuestionText thành công', async () => {
        const existing = makeQuestion();
        const updated = makeQuestion({ QuestionText: 'Updated text' });
        mockQuestionRepository.findById.mockResolvedValue(existing);
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());
        mockQuestionRepository.update.mockResolvedValue(updated);

        const result = await service.updateQuestion(1, { QuestionText: 'Updated text' }, 1);

        expect(result.QuestionText).toBe('Updated text');
        expect(mockQuestionRepository.update).toHaveBeenCalledWith(
            1,
            expect.objectContaining({ QuestionText: 'Updated text' }),
            undefined,
            undefined,
        );
    });

    // TC-QST-023
    it('TC-QST-023 - Throw "Question not found" khi ID không tồn tại', async () => {
        mockQuestionRepository.findById.mockResolvedValue(null);

        await expect(service.updateQuestion(9999, { QuestionText: 'X' }, 1)).rejects.toThrow(
            'Question not found',
        );
        expect(mockQuestionRepository.update).not.toHaveBeenCalled();
    });

    // TC-QST-024
    it('TC-QST-024 - Throw "Failed to update question" khi repository.update trả về null', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());
        mockQuestionRepository.update.mockResolvedValue(null);

        await expect(service.updateQuestion(1, { QuestionText: 'New text' }, 1)).rejects.toThrow(
            'Failed to update question',
        );
    });

    // TC-QST-025
    it('TC-QST-025 - Validate choices khi Choices được truyền trong updateData', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());

        await expect(
            service.updateQuestion(
                1,
                {
                    Choices: [
                        { Content: 'A', Attribute: 'A', IsCorrect: false },
                        { Content: 'B', Attribute: 'B', IsCorrect: false },
                    ],
                },
                1,
            ),
        ).rejects.toThrow('Question must have exactly one correct answer');
    });

    // TC-QST-026
    it('TC-QST-026 - Validate media khi Media được truyền trong updateData (LISTENING không có AudioUrl)', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());

        await expect(
            service.updateQuestion(
                1,
                {
                    Media: {
                        Skill: 'LISTENING',
                        Type: 'MULTIPLE_CHOICE',
                        Section: '3',
                        AudioUrl: undefined,
                    },
                },
                1,
            ),
        ).rejects.toThrow('Listening questions must have audio URL');
    });

    // TC-QST-027
    it('TC-QST-027 - Không validate choices khi Choices không được truyền', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats());
        mockQuestionRepository.update.mockResolvedValue(makeQuestion({ QuestionText: 'Updated' }));

        // Chỉ update text, không truyền Choices → không validate choices
        await expect(
            service.updateQuestion(1, { QuestionText: 'Updated' }, 1),
        ).resolves.toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// deleteQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('deleteQuestion()', () => {
    // TC-QST-028
    it('TC-QST-028 - Xóa question thành công khi chưa được dùng trong exam', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats({ usedInExams: 0 }));
        mockQuestionRepository.delete.mockResolvedValue(true);

        const result = await service.deleteQuestion(1, 1);

        expect(result).toBe(true);
        expect(mockQuestionRepository.delete).toHaveBeenCalledWith(1);
    });

    // TC-QST-029
    it('TC-QST-029 - Throw lỗi khi question đang được dùng trong exam (usedInExams > 0)', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(makeUsageStats({ usedInExams: 3 }));

        await expect(service.deleteQuestion(1, 1)).rejects.toThrow(
            'Cannot delete question that is used in 3 exam(s). Remove it from all exams first.',
        );
        expect(mockQuestionRepository.delete).not.toHaveBeenCalled();
    });

    // TC-QST-030
    it('TC-QST-030 - Throw "Question not found" khi ID không tồn tại', async () => {
        mockQuestionRepository.findById.mockResolvedValue(null);

        await expect(service.deleteQuestion(9999, 1)).rejects.toThrow('Question not found');
        expect(mockQuestionRepository.delete).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getQuestionStatistics()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getQuestionStatistics()', () => {
    // TC-QST-031
    it('TC-QST-031 - Trả về usage stats khi question tồn tại', async () => {
        mockQuestionRepository.findById.mockResolvedValue(makeQuestion());
        mockQuestionRepository.getUsageStats.mockResolvedValue(
            makeUsageStats({ usedInExams: 5, totalAttempts: 200 }),
        );

        const result = await service.getQuestionStatistics(1);

        expect(result.usedInExams).toBe(5);
        expect(result.totalAttempts).toBe(200);
    });

    // TC-QST-032
    it('TC-QST-032 - Throw "Question not found" khi ID không tồn tại', async () => {
        mockQuestionRepository.findById.mockResolvedValue(null);

        await expect(service.getQuestionStatistics(9999)).rejects.toThrow('Question not found');
        expect(mockQuestionRepository.getUsageStats).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getQuestionsBySection()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getQuestionsBySection()', () => {
    // TC-QST-033
    it('TC-QST-033 - Trả về questions khi sections hợp lệ', async () => {
        const questions = [makeQuestion(), makeQuestion({ ID: 2 })];
        mockQuestionRepository.getQuestionsBySection.mockResolvedValue(questions);

        const result = await service.getQuestionsBySection(['5', '6'], 10);

        expect(result).toEqual(questions);
        expect(mockQuestionRepository.getQuestionsBySection).toHaveBeenCalledWith(['5', '6'], 10);
    });

    // TC-QST-034
    it('TC-QST-034 - Throw lỗi khi sections là mảng rỗng', async () => {
        await expect(service.getQuestionsBySection([])).rejects.toThrow(
            'At least one section must be specified',
        );
        expect(mockQuestionRepository.getQuestionsBySection).not.toHaveBeenCalled();
    });

    // TC-QST-035
    it('TC-QST-035 - Throw lỗi khi sections là null/undefined', async () => {
        await expect(service.getQuestionsBySection(null as any)).rejects.toThrow(
            'At least one section must be specified',
        );
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// performBulkOperation()
// ═══════════════════════════════════════════════════════════════════════════════
describe('performBulkOperation()', () => {
    // TC-QST-036
    it('TC-QST-036 - Bulk DELETE thành công trả về success count đúng', async () => {
        mockQuestionRepository.bulkDelete.mockResolvedValue(3);

        const result = await service.performBulkOperation(
            { Operation: 'DELETE', QuestionIDs: [1, 2, 3] },
            1,
        );

        expect(result.success).toBe(3);
        expect(result.failed).toBe(0);
        expect(result.errors).toHaveLength(0);
        expect(mockQuestionRepository.bulkDelete).toHaveBeenCalledWith([1, 2, 3]);
    });

    // TC-QST-037
    it('TC-QST-037 - Bulk DELETE thất bại → failed = số lượng IDs, có error message', async () => {
        mockQuestionRepository.bulkDelete.mockRejectedValue(new Error('DB error'));

        const result = await service.performBulkOperation(
            { Operation: 'DELETE', QuestionIDs: [1, 2, 3] },
            1,
        );

        expect(result.success).toBe(0);
        expect(result.failed).toBe(3);
        expect(result.errors[0]).toContain('Bulk delete failed');
    });

    // TC-QST-038
    it('TC-QST-038 - ADD_TO_EXAM operation trả về error "should be handled by ExamService"', async () => {
        const result = await service.performBulkOperation(
            { Operation: 'ADD_TO_EXAM', QuestionIDs: [1, 2] },
            1,
        );

        expect(result.failed).toBe(2);
        expect(result.errors[0]).toContain('ADD_TO_EXAM operation should be handled by ExamService');
    });

    // TC-QST-039
    it('TC-QST-039 - Unknown operation trả về failed count và error message đúng', async () => {
        const result = await service.performBulkOperation(
            { Operation: 'UNKNOWN_OP' as any, QuestionIDs: [1] },
            1,
        );

        expect(result.failed).toBe(1);
        expect(result.errors[0]).toContain('Unknown operation: UNKNOWN_OP');
    });

    // TC-QST-040
    it('TC-QST-040 - Bulk DELETE với danh sách IDs rỗng trả về success=0', async () => {
        mockQuestionRepository.bulkDelete.mockResolvedValue(0);

        const result = await service.performBulkOperation(
            { Operation: 'DELETE', QuestionIDs: [] },
            1,
        );

        expect(result.success).toBe(0);
        expect(result.failed).toBe(0);
    });
});