/**
 * Integration Tests for QuestionService
 * File gốc  : src/application/services/question.service.ts
 * Test file : src/__tests__/question.service.spec.ts
 * Test Cases: TC-QST-001 → TC-QST-040
 *
 * Rollback: Sử dụng Transaction thật qua QueryRunner.
 * Mỗi test (it) sẽ tạo 1 transaction và ROLLBACK sau khi chạy xong.
 * Dữ liệu trong DB KHÔNG bị thay đổi sau khi chạy test.
 */

import { AppDataSource, initializeDatabase, closeDatabase } from '../infrastructure/database/config';
import { QuestionService } from '../application/services/question.service';
import { Question } from '../domain/entities/question.entity';
import { QueryRunner } from 'typeorm';

// ─── Setup DB ─────────────────────────────────────────────────────────────────
let service: QuestionService;
let queryRunner: QueryRunner;
let originalTransactionMethod: any;
let originalGetRepositoryMethod: any;

const USER_ID = 55; // Dùng user id 55 (admin) theo yêu cầu của user

beforeAll(async () => {
    // Kết nối với Real Database (thông qua config.ts)
    await AppDataSource.initialize();
});

afterAll(async () => {
    // Đóng kết nối khi chạy xong toàn bộ test
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

beforeEach(async () => {
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Patch AppDataSource.transaction để luôn dùng queryRunner hiện tại
    originalTransactionMethod = AppDataSource.transaction;
    AppDataSource.transaction = async function (cb: any) {
        return cb(queryRunner.manager);
    } as any;

    // Patch AppDataSource.getRepository để các repository con dùng queryRunner manager
    originalGetRepositoryMethod = AppDataSource.getRepository;
    AppDataSource.getRepository = function (entity: any) {
        return queryRunner.manager.getRepository(entity);
    } as any;

    service = new QuestionService();
});

afterEach(async () => {
    // Luôn rollback lại mọi thay đổi trong test
    if (queryRunner) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
    }

    // Restore method cũ
    AppDataSource.transaction = originalTransactionMethod;
    AppDataSource.getRepository = originalGetRepositoryMethod;
    jest.restoreAllMocks();
});

// ─── Helper factories cho Integration Test ────────────────────────────────────
const makeCreateDto = (overrides: any = {}) => ({
    QuestionText: 'Sample Question Integration Test?',
    Media: {
        Skill: 'LISTENING',
        Type: 'MULTIPLE_CHOICE',
        Section: '3',
        AudioUrl: '/test-audio.mp3',
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

async function insertMockQuestion(customQuestionText = 'Mock Question') {
    const dto = makeCreateDto({ QuestionText: customQuestionText });
    return await service.createQuestion(dto, USER_ID);
}

// ═══════════════════════════════════════════════════════════════════════════════
// createQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('createQuestion()', () => {
    // TC-QST-001
    it('TC-QST-001 - Tạo question thành công với dữ liệu hợp lệ (LISTENING + AudioUrl)', async () => {
        // Arrange
        const dto = makeCreateDto();

        // Act
        const result = await service.createQuestion(dto, USER_ID);

        // Assert - Trả về object đúng
        expect(result).toBeDefined();
        expect(result.ID).toBeGreaterThan(0);
        expect(result.QuestionText).toBe('Sample Question Integration Test?');
        expect(result.UserID).toBe(USER_ID);

        // CheckDB - Verify DB đã lưu thật
        const inDb = await queryRunner.manager.findOne(Question, {
            where: { ID: result.ID },
            relations: ['mediaQuestion', 'choices'],
        });
        expect(inDb).not.toBeNull();
        expect(inDb!.QuestionText).toBe('Sample Question Integration Test?');
        expect(inDb!.mediaQuestion.Skill).toBe('LISTENING');
        expect(inDb!.choices).toHaveLength(4);
    });

    // TC-QST-002
    it('TC-QST-002 - Throw lỗi khi LISTENING question thiếu AudioUrl', async () => {
        const dto = makeCreateDto({
            Media: { Skill: 'LISTENING', Type: 'MULTIPLE_CHOICE', Section: '3', AudioUrl: undefined },
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Listening questions must have audio URL');

        // Count in DB to ensure no partial inserts
        const count = await queryRunner.manager.count(Question, { where: { QuestionText: dto.QuestionText } });
        expect(count).toBe(0);
    });

    // TC-QST-003
    it('TC-QST-003 - Throw lỗi khi Part 1 (Section="1") không có ImageUrl', async () => {
        const dto = makeCreateDto({
            Media: { Skill: 'LISTENING', Type: 'PHOTO', Section: '1', AudioUrl: '/audio.mp3', ImageUrl: undefined },
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Part 1 questions must have an image');
    });


    // TC-QST-004
    it('TC-QST-004 - Throw lỗi khi ImageUrl có format không hợp lệ', async () => {
        const dto = makeCreateDto({
            Media: { Skill: 'READING', Type: 'MULTIPLE_CHOICE', Section: '5', AudioUrl: undefined, ImageUrl: 'invalid-url' },
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Invalid image URL format');
    });

    // TC-QST-005
    it('TC-QST-005 - Throw lỗi khi choices có ít hơn 2 phần tử', async () => {
        const dto = makeCreateDto({
            Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }],
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Question must have at least 2 choices');
    });

    // TC-QST-006
    it('TC-QST-006 - Throw lỗi khi không có đáp án đúng nào (0 correct)', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: false },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Question must have exactly one correct answer');
    });

    // TC-QST-007
    it('TC-QST-007 - Throw lỗi khi có 2 đáp án đúng', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: true },
            ],
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('Question must have exactly one correct answer');
    });


    // TC-QST-008
    it('TC-QST-008 - Throw lỗi khi choice có content rỗng (empty string)', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: '', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('All choices must have content');
    });

    // TC-QST-009
    it('TC-QST-009 - Throw lỗi khi choice có content chỉ là whitespace', async () => {
        const dto = makeCreateDto({
            Choices: [
                { Content: '   ', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
            ],
        });

        await expect(service.createQuestion(dto, USER_ID)).rejects.toThrow('All choices must have content');
    });

    // TC-QST-010
    it('TC-QST-010 - Tạo thành công READING question không cần AudioUrl', async () => {
        const dto = makeCreateDto({
            Media: { Skill: 'READING', Type: 'MULTIPLE_CHOICE', Section: '5', AudioUrl: undefined },
        });

        const result = await service.createQuestion(dto, USER_ID);

        expect(result).toBeDefined();
        expect(result.mediaQuestion.Skill).toBe('READING');
        expect(result.mediaQuestion.AudioUrl).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getQuestionById()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getQuestionById()', () => {
    // TC-QST-011
    it('TC-QST-011 - Trả về question khi ID tồn tại', async () => {
        // Arrange
        const created = await insertMockQuestion('Test findById');

        // Act
        const result = await service.getQuestionById(created.ID);

        // Assert
        expect(result).toBeDefined();
        expect(result.ID).toBe(created.ID);
        expect(result.QuestionText).toBe('Test findById');
    });

    // TC-QST-012
    it('TC-QST-012 - Throw "Question not found" khi ID không tồn tại', async () => {
        await expect(service.getQuestionById(999999)).rejects.toThrow('Question not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// searchQuestions()
// ═══════════════════════════════════════════════════════════════════════════════
describe('searchQuestions()', () => {
    // TC-QST-013
    it('TC-QST-013 - Trả về paginated questions với metadata đúng', async () => {
        // Arrange
        await insertMockQuestion('TC-QST-017 Question 1');
        await insertMockQuestion('TC-QST-017 Question 2');

        // Act
        const result = await service.searchQuestions({ SearchText: 'TC-QST-017', Page: 1, Limit: 10 });

        // Assert
        expect(result.Questions.length).toBeGreaterThanOrEqual(2);
        expect(result.Pagination.CurrentPage).toBe(1);
        expect(result.Pagination.TotalQuestions).toBeGreaterThanOrEqual(2);
    });

    // TC-QST-014
    it('TC-QST-014 - Trả về danh sách rỗng khi không có question nào match', async () => {
        const result = await service.searchQuestions({ SearchText: 'UNIQUE_TEXT_NOT_FOUND_12345' });

        expect(result.Questions).toHaveLength(0);
        expect(result.Pagination.TotalQuestions).toBe(0);
    });

    // TC-QST-015
    it('TC-QST-015 - Filter theo Skill và Section', async () => {
        const dto = makeCreateDto({
            Media: { Skill: 'READING', Type: 'MULTIPLE_CHOICE', Section: '7', AudioUrl: undefined },
            QuestionText: 'Filter specific question TC-QST-020'
        });
        await service.createQuestion(dto, USER_ID);

        const result = await service.searchQuestions({ Skill: 'READING', Section: '7', Limit: 1000 });

        expect(result.Questions.length).toBeGreaterThanOrEqual(1);
        const q = result.Questions.find(q => q.QuestionText === 'Filter specific question TC-QST-020');
        expect(q).toBeDefined();
        expect(q!.Media.Section).toBe('7');
    });

});

// ═══════════════════════════════════════════════════════════════════════════════
// updateQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('updateQuestion()', () => {
    // TC-QST-016
    it('TC-QST-016 - Update QuestionText thành công', async () => {
        // Arrange
        const created = await insertMockQuestion('Old Text');

        // Act
        const result = await service.updateQuestion(created.ID, { QuestionText: 'New Text' }, USER_ID);

        // Assert
        expect(result.QuestionText).toBe('New Text');

        // CheckDB
        const inDb = await queryRunner.manager.findOne(Question, { where: { ID: created.ID } });
        expect(inDb!.QuestionText).toBe('New Text');
    });

    // TC-QST-017
    it('TC-QST-017 - Throw "Question not found" khi ID không tồn tại', async () => {
        await expect(service.updateQuestion(999999, { QuestionText: 'X' }, USER_ID)).rejects.toThrow('Question not found');
    });

    // TC-QST-018
    it('TC-QST-018 - Validate media khi Media được update (LISTENING không AudioUrl)', async () => {
        const created = await insertMockQuestion();

        await expect(
            service.updateQuestion(
                created.ID,
                { Media: { Skill: 'LISTENING', Type: 'MULTIPLE_CHOICE', Section: '3', AudioUrl: undefined } as any },
                USER_ID,
            ),
        ).rejects.toThrow('Listening questions must have audio URL');
    });

    // TC-QST-019
    it('TC-QST-019 - Không validate choices khi Choices không được truyền', async () => {
        const created = await insertMockQuestion();

        // Chỉ update text, không truyền Choices
        await expect(
            service.updateQuestion(created.ID, { QuestionText: 'Updated' }, USER_ID),
        ).resolves.toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// deleteQuestion()
// ═══════════════════════════════════════════════════════════════════════════════
describe('deleteQuestion()', () => {
    // TC-QST-020
    it('TC-QST-020 - Xóa question thành công khi chưa được dùng trong exam', async () => {
        // Arrange
        const created = await insertMockQuestion('To be deleted');

        // Act
        const result = await service.deleteQuestion(created.ID, USER_ID);

        // Assert
        expect(result).toBe(true);

        // CheckDB - Verify đã biến mất
        const inDb = await queryRunner.manager.findOne(Question, { where: { ID: created.ID } });
        expect(inDb).toBeNull();
    });

    // TC-QST-021 (Not easily testable without Exam mock data, skipping direct DB state test or mocking getUsageStats specifically)
    it('TC-QST-021 - Throw lỗi khi question đang được dùng trong exam (usedInExams > 0)', async () => {
        // Since we are doing integration test, mocking getUsageStats here temporarily to test validation logic
        const created = await insertMockQuestion();
        const repo: any = (service as any).questionRepository;
        const originalStats = repo.getUsageStats;
        repo.getUsageStats = jest.fn().mockResolvedValue({ usedInExams: 3 });

        await expect(service.deleteQuestion(created.ID, USER_ID)).rejects.toThrow(
            'Cannot delete question that is used in 3 exam(s). Remove it from all exams first.',
        );

        repo.getUsageStats = originalStats; // restore
    });

    // TC-QST-022
    it('TC-QST-022 - Throw "Question not found" khi ID không tồn tại', async () => {
        await expect(service.deleteQuestion(999999, USER_ID)).rejects.toThrow('Question not found');
    });
});

// // ═══════════════════════════════════════════════════════════════════════════════
// // getQuestionStatistics()
// // ═══════════════════════════════════════════════════════════════════════════════
// describe('getQuestionStatistics()', () => {
//     // TC-QST-031
//     it('TC-QST-031 - Trả về usage stats khi question tồn tại', async () => {
//         const created = await insertMockQuestion();
//         const result = await service.getQuestionStatistics(created.ID);

//         expect(result.usedInExams).toBeDefined();
//         expect(result.totalAttempts).toBeDefined();
//     });

//     // TC-QST-032
//     it('TC-QST-032 - Throw "Question not found" khi ID không tồn tại', async () => {
//         await expect(service.getQuestionStatistics(999999)).rejects.toThrow('Question not found');
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
// getQuestionsBySection()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getQuestionsBySection()', () => {
    // TC-QST-023
    it('TC-QST-023 - Trả về questions khi sections hợp lệ', async () => {
        await insertMockQuestion(); // Mặc định section là 3

        const result = await service.getQuestionsBySection(['3'], 10);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    // TC-QST-024
    it('TC-QST-024 - Throw lỗi khi sections là mảng rỗng', async () => {
        await expect(service.getQuestionsBySection([])).rejects.toThrow('At least one section must be specified');
    });

    // TC-QST-025
    it('TC-QST-035 - Throw lỗi khi sections là null/undefined', async () => {
        await expect(service.getQuestionsBySection(null as any)).rejects.toThrow('At least one section must be specified');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// performBulkOperation()
// ═══════════════════════════════════════════════════════════════════════════════
describe('performBulkOperation()', () => {
    // TC-QST-026
    it('TC-QST-026 - Bulk DELETE thành công trả về success count đúng', async () => {
        const q1 = await insertMockQuestion();
        const q2 = await insertMockQuestion();

        const result = await service.performBulkOperation(
            { Operation: 'DELETE', QuestionIDs: [q1.ID, q2.ID] },
            USER_ID,
        );

        expect(result.success).toBe(2);
        expect(result.failed).toBe(0);

        // Verify DB
        const count = await queryRunner.manager.count(Question, { where: [{ ID: q1.ID }, { ID: q2.ID }] });
        expect(count).toBe(0);
    });

    // TC-QST-027
    it('TC-QST-027 - ADD_TO_EXAM operation trả về error "should be handled by ExamService"', async () => {
        const result = await service.performBulkOperation(
            { Operation: 'ADD_TO_EXAM', QuestionIDs: [1, 2] },
            USER_ID,
        );

        expect(result.failed).toBe(2);
        expect(result.errors[0]).toContain('ADD_TO_EXAM operation should be handled by ExamService');
    });

    // TC-QST-028
    it('TC-QST-028 - Unknown operation trả về failed count và error message đúng', async () => {
        const result = await service.performBulkOperation(
            { Operation: 'UNKNOWN_OP' as any, QuestionIDs: [1] },
            USER_ID,
        );

        expect(result.failed).toBe(1);
        expect(result.errors[0]).toContain('Unknown operation: UNKNOWN_OP');
    });
});