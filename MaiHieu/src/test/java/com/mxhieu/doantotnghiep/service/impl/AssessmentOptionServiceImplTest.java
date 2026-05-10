package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.repository.AssessmentOptionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test cho AssessmentOptionServiceImpl
 *
 * Service này chỉ có 1 method: deleteAssessmentOptionByQuestionId
 * Theo docs đồ án, AssessmentOption là các lựa chọn đáp án cho câu hỏi đánh giá
 * (Bảng 2.20).
 * Khi xóa câu hỏi đánh giá, cần xóa toàn bộ option liên quan.
 *
 * Cấu trúc mỗi test: DATA → MOCK → ACTION → CHECK DB/DATA → ROLLBACK (tự động)
 */
@ExtendWith(MockitoExtension.class)
class AssessmentOptionServiceImplTest {

    @Mock
    private AssessmentOptionRepository assessmentOptionRepository;

    @InjectMocks
    private AssessmentOptionServiceImpl assessmentOptionService;

    // ==================== MAI-AOS-001 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AOS-001: Xóa option theo questionId hợp lệ - gọi đúng repository")
    void deleteAssessmentOptionByQuestionId_ValidId_ShouldCallRepository() {
        // === DATA: questionId hợp lệ ===
        Integer questionId = 1;

        // === MOCK: Không cần mock return vì method void, chỉ cần verify gọi đúng ===
        doNothing().when(assessmentOptionRepository).deleteByAssessmentQuestion_Id(questionId);

        // === ACTION: Gọi method xóa ===
        assertDoesNotThrow(() -> assessmentOptionService.deleteAssessmentOptionByQuestionId(questionId));

        // === CHECK DB/DATA: Verify repository được gọi đúng 1 lần với đúng tham số ===
        verify(assessmentOptionRepository, times(1)).deleteByAssessmentQuestion_Id(questionId);

        // === ROLLBACK: @Transactional + @Rollback tự động rollback ===
    }

    // ==================== MAI-AOS-002 ====================
    @Test
    @DisplayName("MAI-AOS-002: Truyền ID null phải báo lỗi ngay tại Service")
    void deleteAssessmentOptionByQuestionId_NullId_ShouldThrowException() {
        // 1. DATA
        Integer questionId = null;

        // 2. ACTION + CHECK
        // Chúng ta mong đợi nó PHẢI ném lỗi, chứ không được im lặng gọi Repository
        assertThrows(IllegalArgumentException.class, () -> {
            assessmentOptionService.deleteAssessmentOptionByQuestionId(questionId);
        });

        // 3. VERIFY
        // Đảm bảo rằng Repository CHƯA bao giờ được gọi (vì bị chặn ở tầng Service rồi)
        verify(assessmentOptionRepository, never()).deleteByAssessmentQuestion_Id(any());
    }

    // ==================== MAI-AOS-003 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-AOS-003: Xóa option khi repository ném exception - exception phải được ném ra")
    void deleteAssessmentOptionByQuestionId_RepositoryThrows_ShouldPropagateException() {
        // === DATA: questionId không tồn tại trong DB ===
        Integer questionId = 999;

        // === MOCK: Repository ném RuntimeException khi gọi xóa ===
        doThrow(new RuntimeException("Database error"))
                .when(assessmentOptionRepository).deleteByAssessmentQuestion_Id(questionId);

        // === ACTION + CHECK: Exception phải được truyền ra ngoài ===
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> assessmentOptionService.deleteAssessmentOptionByQuestionId(questionId));

        // === CHECK DB/DATA: Xác nhận message lỗi đúng ===
        assertEquals("Database error", exception.getMessage());

        // === ROLLBACK: @Transactional + @Rollback tự động rollback ===
    }

    // ==================== MAI-AOS-004 ====================
    @Test
    @DisplayName("MAI-AOS-004: Truyền ID = 0 phải báo lỗi ngay tại Service")
    void deleteAssessmentOptionByQuestionId_ZeroId_ShouldThrowException() {
        // 1. DATA
        Integer questionId = 0;

        // 2. ACTION + CHECK
        assertThrows(IllegalArgumentException.class, () -> {
            assessmentOptionService.deleteAssessmentOptionByQuestionId(questionId);
        });

        // 3. VERIFY
        verify(assessmentOptionRepository, never()).deleteByAssessmentQuestion_Id(any());
    }

    // ==================== MAI-AOS-005 ====================
    @Test
    @DisplayName("MAI-AOS-005: Truyền ID âm phải báo lỗi ngay tại Service")
    void deleteAssessmentOptionByQuestionId_NegativeId_ShouldThrowException() {
        // 1. DATA
        Integer questionId = -1;

        // 2. ACTION + CHECK
        assertThrows(IllegalArgumentException.class, () -> {
            assessmentOptionService.deleteAssessmentOptionByQuestionId(questionId);
        });

        // 3. VERIFY
        verify(assessmentOptionRepository, never()).deleteByAssessmentQuestion_Id(any());
    }
}
