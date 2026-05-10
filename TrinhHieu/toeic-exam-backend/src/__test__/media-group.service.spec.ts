/**
 * Integration Tests for MediaGroupService
 * File gốc  : src/application/services/media-group.service.ts
 * Test file : src/__tests__/media-group.service.spec.ts
 * Test Cases: TC-MGS-001 → ...
 *
 * Rollback: Sử dụng Transaction thật qua QueryRunner.
 * Patch AppDataSource.transaction và AppDataSource.getRepository
 * để đảm bảo mọi thao tác lưu vào DB đều thông qua queryRunner
 * và tự động ROLLBACK sau khi mỗi test chạy xong.
 */

import { AppDataSource, initializeDatabase, closeDatabase } from '../infrastructure/database/config';
import { MediaGroupService } from '../application/services/media-group.service';
import { QueryRunner } from 'typeorm';

// ─── Setup DB ─────────────────────────────────────────────────────────────────
let service: MediaGroupService;
let queryRunner: QueryRunner;
let originalTransactionMethod: any;
let originalGetRepositoryMethod: any;

const USER_ID = 55; // Admin

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

    // Patch AppDataSource.transaction để dùng queryRunner hiện tại
    originalTransactionMethod = AppDataSource.transaction;
    AppDataSource.transaction = async function (cb: any) {
        return cb(queryRunner.manager);
    } as any;

    // Patch AppDataSource.getRepository để các repository con dùng queryRunner manager
    originalGetRepositoryMethod = AppDataSource.getRepository;
    AppDataSource.getRepository = function (entity: any) {
        return queryRunner.manager.getRepository(entity);
    } as any;

    // Phải khởi tạo service SAU KHI patch getRepository
    // vì service khởi tạo repositories bên trong constructor của nó
    service = new MediaGroupService();
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
const makeCreateMediaGroupDto = (overrides: any = {}) => ({
    Title: 'Test Media Group Title',
    Description: 'Test Media Group Description',
    Media: {
        Skill: 'READING',
        Type: 'PASSAGE',
        Section: '7',
        Script: 'This is a test script for reading comprehension.',
    },
    Difficulty: 'MEDIUM',
    Tags: ['Test', 'Integration'],
    OrderIndex: 1,
    Questions: [
        {
            QuestionText: 'What is the main topic of the passage?',
            OrderInGroup: 1,
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false },
                { Content: 'C', Attribute: 'C', IsCorrect: false },
                { Content: 'D', Attribute: 'D', IsCorrect: false },
            ],
        },
        {
            QuestionText: 'What does the word "script" mean in paragraph 1?',
            OrderInGroup: 2,
            Choices: [
                { Content: 'A document', Attribute: 'A', IsCorrect: false },
                { Content: 'A text', Attribute: 'B', IsCorrect: true },
                { Content: 'A play', Attribute: 'C', IsCorrect: false },
            ], // 3 choices for edge case test if needed, but rule says at least 2
        }
    ],
    ...overrides,
});

async function insertMockMediaGroup(customTitle = 'Mock Group') {
    const dto = makeCreateMediaGroupDto({ Title: customTitle });
    return await service.createMediaGroup(dto as any, USER_ID);
}

// ═══════════════════════════════════════════════════════════════════════════════
// createMediaGroup()
// ═══════════════════════════════════════════════════════════════════════════════
describe('createMediaGroup()', () => {
    it('TC-MGS-001 - Tạo media group thành công với dữ liệu hợp lệ', async () => {
        // Arrange
        const dto = makeCreateMediaGroupDto();

        // Act
        const result = await service.createMediaGroup(dto as any, USER_ID);

        // Assert
        expect(result).toBeDefined();
        expect(result.MediaQuestionID).toBeGreaterThan(0);
        expect(result.Title).toBe(dto.Title);
        expect(result.Media.Skill).toBe(dto.Media.Skill);
        expect(result.TotalQuestions).toBe(dto.Questions.length);

        // Assert Questions
        expect(result.Questions.length).toBe(2);
        expect(result.Questions[0].Choices.length).toBe(4);
        expect(result.Questions[1].Choices.length).toBe(3);
    });

    it('TC-MGS-002 - Throw lỗi khi không có câu hỏi nào (Questions array rỗng)', async () => {
        const dto = makeCreateMediaGroupDto({ Questions: [] });
        await expect(service.createMediaGroup(dto as any, USER_ID))
            .rejects.toThrow('Media group must have at least one question');
    });

    it('TC-MGS-003 - Throw lỗi khi OrderInGroup bị trùng lặp', async () => {
        const dto = makeCreateMediaGroupDto({
            Questions: [
                { QuestionText: 'Q1', OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }] },
                { QuestionText: 'Q2', OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }, { Content: 'B', Attribute: 'B', IsCorrect: false }] },
            ]
        });
        await expect(service.createMediaGroup(dto as any, USER_ID))
            .rejects.toThrow('OrderInGroup values must be unique within the group');
    });

    it('TC-MGS-004 - Throw lỗi khi câu hỏi có ít hơn 2 lựa chọn', async () => {
        const dto = makeCreateMediaGroupDto({
            Questions: [
                { QuestionText: 'Q1', OrderInGroup: 1, Choices: [{ Content: 'A', Attribute: 'A', IsCorrect: true }] }
            ]
        });
        await expect(service.createMediaGroup(dto as any, USER_ID))
            .rejects.toThrow('Question at position 1 must have at least 2 choices');
    });

    it('TC-MGS-005 - Throw lỗi khi câu hỏi không có đáp án đúng nào', async () => {
        const dto = makeCreateMediaGroupDto({
            Questions: [
                {
                    QuestionText: 'Q1', OrderInGroup: 1, Choices: [
                        { Content: 'A', Attribute: 'A', IsCorrect: false },
                        { Content: 'B', Attribute: 'B', IsCorrect: false }
                    ]
                }
            ]
        });
        await expect(service.createMediaGroup(dto as any, USER_ID))
            .rejects.toThrow('Question at position 1 must have exactly one correct answer');
    });

    it('TC-MGS-006 - Throw lỗi khi câu hỏi có nhiều hơn 1 đáp án đúng', async () => {
        const dto = makeCreateMediaGroupDto({
            Questions: [
                {
                    QuestionText: 'Q1', OrderInGroup: 1, Choices: [
                        { Content: 'A', Attribute: 'A', IsCorrect: true },
                        { Content: 'B', Attribute: 'B', IsCorrect: true }
                    ]
                }
            ]
        });
        await expect(service.createMediaGroup(dto as any, USER_ID))
            .rejects.toThrow('Question at position 1 must have exactly one correct answer');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getMediaGroupDetail()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getMediaGroupDetail()', () => {
    it('TC-MGS-007 - Lấy chi tiết media group thành công', async () => {
        // Arrange
        const createdGroup = await insertMockMediaGroup('Group to detail');

        // Act
        const result = await service.getMediaGroupDetail(createdGroup.MediaQuestionID);

        // Assert
        expect(result).toBeDefined();
        expect(result.MediaQuestionID).toBe(createdGroup.MediaQuestionID);
        expect(result.Title).toBe('Group to detail');
        expect(result.TotalQuestions).toBe(2);
        expect(result.Questions[0].QuestionText).toBe('What is the main topic of the passage?');
    });

    it('TC-MGS-008 - Throw lỗi khi media group không tồn tại', async () => {
        await expect(service.getMediaGroupDetail(999999))
            .rejects.toThrow('Media group not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// updateMediaGroupMetadata()
// ═══════════════════════════════════════════════════════════════════════════════
describe('updateMediaGroupMetadata()', () => {
    it('TC-MGS-009 - Cập nhật metadata thành công', async () => {
        // Arrange
        const createdGroup = await insertMockMediaGroup('Group to update');
        const updateDto = {
            Title: 'Updated Title',
            Difficulty: 'HARD',
            Media: {
                Skill: 'LISTENING',
                Type: 'AUDIO',
                Section: '1',
                AudioUrl: '/new-audio.mp3'
            }
        };

        // Act
        const result = await service.updateMediaGroupMetadata(createdGroup.MediaQuestionID, updateDto as any);

        // Assert
        expect(result).toBeDefined();
        expect(result.Title).toBe('Updated Title');
        expect(result.Difficulty).toBe('HARD');
        expect(result.Media.AudioUrl).toBe('/new-audio.mp3');
    });

    it('TC-MGS-010 - Throw lỗi khi cập nhật media group không tồn tại', async () => {
        await expect(service.updateMediaGroupMetadata(999999, {}))
            .rejects.toThrow('Media group not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// deleteMediaGroup()
// ═══════════════════════════════════════════════════════════════════════════════
describe('deleteMediaGroup()', () => {
    it('TC-MGS-011 - Xoá media group thành công và cascade các câu hỏi liên quan', async () => {
        // Arrange
        const createdGroup = await insertMockMediaGroup('Group to delete');

        // Act
        const result = await service.deleteMediaGroup(createdGroup.MediaQuestionID);

        // Assert
        expect(result).toBe(true);

        // Verify group is deleted
        await expect(service.getMediaGroupDetail(createdGroup.MediaQuestionID))
            .rejects.toThrow('Media group not found');

        // Các questions và choices cũng bị xoá (verify thông qua count database trực tiếp nếu cần,
        // nhưng ở đây được trigger bởi service -> repository)
    });

    it('TC-MGS-012 - Throw lỗi khi xoá media group không tồn tại', async () => {
        await expect(service.deleteMediaGroup(999999))
            .rejects.toThrow('Media group not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getMediaGroupStatistics()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getMediaGroupStatistics()', () => {
    it('TC-MGS-013 - Lấy thống kê cơ bản của media group', async () => {
        // Arrange
        const createdGroup = await insertMockMediaGroup('Group for stats');

        // Act
        const stats = await service.getMediaGroupStatistics(createdGroup.MediaQuestionID);

        // Assert
        expect(stats).toBeDefined();
        expect(stats.mediaGroupId).toBe(createdGroup.MediaQuestionID);
        expect(stats.questionCount).toBe(2);
        expect(stats.usedInExams).toBe(0); // Vì test data mới tạo chưa gán vào exam nào
        expect(stats.totalAttempts).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getMediaGroupsForBrowsing()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getMediaGroupsForBrowsing()', () => {
    it('TC-MGS-014 - Lấy danh sách media groups', async () => {
        // Arrange
        await insertMockMediaGroup('Group Browse 1');
        await insertMockMediaGroup('Group Browse 2');

        // Act
        const result = await service.getMediaGroupsForBrowsing({ Page: 1, Limit: 10 });

        // Assert
        expect(result).toBeDefined();
        expect(result.groups).toBeInstanceOf(Array);
        expect(result.groups.length).toBeGreaterThanOrEqual(2);
        expect(result.pagination.TotalPages).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// cloneMediaGroup()
// ═══════════════════════════════════════════════════════════════════════════════
describe('cloneMediaGroup()', () => {
    it('TC-MGS-015 - Clone media group thành công (kèm theo questions)', async () => {
        // Arrange
        const originalGroup = await insertMockMediaGroup('Original Group');

        // Act
        const clonedGroup = await service.cloneMediaGroup(originalGroup.MediaQuestionID, USER_ID, 'Cloned Group');

        // Assert
        expect(clonedGroup).toBeDefined();
        expect(clonedGroup.MediaQuestionID).not.toBe(originalGroup.MediaQuestionID); // Phải là ID mới
        expect(clonedGroup.Title).toBe('Cloned Group');
        expect(clonedGroup.TotalQuestions).toBe(originalGroup.TotalQuestions);

        // Assert Questions
        expect(clonedGroup.Questions.length).toBe(2);
        expect(clonedGroup.Questions[0].QuestionText).toBe(originalGroup.Questions[0].QuestionText);
        expect(clonedGroup.Questions[0].ID).not.toBe(originalGroup.Questions[0].ID); // ID question phải khác
    });

    it('TC-MGS-016 - Clone media group thành công không truyền newTitle (dùng mặc định)', async () => {
        // Arrange
        const originalGroup = await insertMockMediaGroup('Original Group 2');

        // Act
        const clonedGroup = await service.cloneMediaGroup(originalGroup.MediaQuestionID, USER_ID);

        // Assert
        expect(clonedGroup).toBeDefined();
        expect(clonedGroup.MediaQuestionID).not.toBe(originalGroup.MediaQuestionID);
        expect(clonedGroup.TotalQuestions).toBe(originalGroup.TotalQuestions);
    });

    it('TC-MGS-017 - Throw lỗi khi clone media group không tồn tại', async () => {
        await expect(service.cloneMediaGroup(999999, USER_ID))
            .rejects.toThrow('Media group not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// addQuestionToGroup()
// ═══════════════════════════════════════════════════════════════════════════════
describe('addQuestionToGroup()', () => {
    it('TC-MGS-018 - Add thêm question vào group thành công (truyền OrderInGroup)', async () => {
        // Arrange
        const group = await insertMockMediaGroup('Group to add Q');
        const questionData = {
            QuestionText: 'New added question?',
            OrderInGroup: 3, // Group mặc định có 1 và 2 rồi
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false }
            ]
        };

        // Act
        const result = await service.addQuestionToGroup(group.MediaQuestionID, questionData, USER_ID);

        // Assert
        expect(result).toBeDefined();
        expect(result.QuestionText).toBe('New added question?');
        expect(result.OrderInGroup).toBe(3);
        expect(result.MediaQuestionID).toBe(group.MediaQuestionID);

        // Verify via detail
        const updatedGroup = await service.getMediaGroupDetail(group.MediaQuestionID);
        expect(updatedGroup.TotalQuestions).toBe(3);
    });

    it('TC-MGS-019 - Add thêm question vào group thành công (auto-assign OrderInGroup)', async () => {
        // Arrange
        const group = await insertMockMediaGroup('Group for auto order');
        const questionData = {
            QuestionText: 'Auto order question?',
            OrderInGroup: 0, // Không truyền
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false }
            ]
        };

        // Act
        const result = await service.addQuestionToGroup(group.MediaQuestionID, questionData as any, USER_ID);

        // Assert
        expect(result).toBeDefined();
        // Order tiếp theo sẽ tự được tính (trong trường hợp này có thể là 3)
        expect(result.OrderInGroup).toBeGreaterThanOrEqual(3);

        // Verify via detail
        const updatedGroup = await service.getMediaGroupDetail(group.MediaQuestionID);
        expect(updatedGroup.TotalQuestions).toBe(3);
    });

    it('TC-MGS-020 - Throw lỗi khi OrderInGroup bị trùng', async () => {
        // Arrange
        const group = await insertMockMediaGroup('Group duplicated order');
        const questionData = {
            QuestionText: 'Duplicated order question?',
            OrderInGroup: 1, // Đã tồn tại order 1
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false }
            ]
        };

        // Act & Assert
        await expect(service.addQuestionToGroup(group.MediaQuestionID, questionData, USER_ID))
            .rejects.toThrow('OrderInGroup 1 is already used in this media group');
    });

    it('TC-MGS-021 - Throw lỗi khi add question vào group không tồn tại', async () => {
        const questionData = {
            QuestionText: 'Invalid group question?',
            OrderInGroup: 1,
            Choices: [
                { Content: 'A', Attribute: 'A', IsCorrect: true },
                { Content: 'B', Attribute: 'B', IsCorrect: false }
            ]
        };

        await expect(service.addQuestionToGroup(999999, questionData, USER_ID))
            .rejects.toThrow('Media group not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// removeQuestionFromGroup()
// ═══════════════════════════════════════════════════════════════════════════════
describe('removeQuestionFromGroup()', () => {
    it('TC-MGS-022 - Remove question thành công khỏi group', async () => {
        // Arrange
        const group = await insertMockMediaGroup('Group to remove Q');
        const questionToRemove = group.Questions[0];

        // Act
        const result = await service.removeQuestionFromGroup(group.MediaQuestionID, questionToRemove.ID);

        // Assert
        expect(result).toBe(true);

        // Verify via detail
        const updatedGroup = await service.getMediaGroupDetail(group.MediaQuestionID);
        expect(updatedGroup.TotalQuestions).toBe(1); // 2 - 1 = 1
    });

    it('TC-MGS-023 - Throw lỗi khi question không thuộc về group', async () => {
        // Arrange
        const group1 = await insertMockMediaGroup('Group 1');
        const group2 = await insertMockMediaGroup('Group 2');
        const questionOfGroup1 = group1.Questions[0];

        // Act & Assert (Cố tình remove question của group1 bằng group2)
        await expect(service.removeQuestionFromGroup(group2.MediaQuestionID, questionOfGroup1.ID))
            .rejects.toThrow('Question not found in this media group');
    });

    it('TC-MGS-024 - Throw lỗi khi question đang được dùng trong exam', async () => {
        // Arrange
        const group = await insertMockMediaGroup('Group with used question');
        const questionToRemove = group.Questions[0];

        // Mock getUsageStats để mô phỏng question đang được sử dụng
        const repo: any = (service as any).questionRepository;
        const originalStats = repo.getUsageStats;
        repo.getUsageStats = jest.fn().mockResolvedValue({ usedInExams: 2 });

        // Act & Assert
        await expect(service.removeQuestionFromGroup(group.MediaQuestionID, questionToRemove.ID))
            .rejects.toThrow('Cannot remove question: It is used in 2 exam(s)');

        // Restore
        repo.getUsageStats = originalStats;
    });
});