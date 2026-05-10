package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test cho ExerciseTypeServiceImpl sử dụng MySQL.
 *
 * Nghiệp vụ (Docs đồ án):
 * - Cung cấp danh mục các loại bài tập để giáo viên lựa chọn khi tạo bài mới.
 * - Các loại phổ biến: MULTIPLE_CHOICE, TRUE_FALSE, INTERACTIVE, PART_1...7.
 *
 * Liên kết System Test:
 * - QLBTKH-VD-04: Kiểm tra danh sách thể loại bài tập hiển thị cho giáo viên.
 *
 * Cấu trúc kiểm thử: DATA -> ACTION -> CHECK DB -> ROLLBACK.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExerciseTypeServiceImplTest {

    @Autowired
    private ExerciseTypeServiceImpl exerciseTypeService;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    /**
     * Helper tạo dữ liệu mẫu cho các loại bài tập với Code duy nhất để tránh xung đột dữ liệu thật.
     */
    private void setupExerciseTypes() {
        if (exerciseTypeRepository.findByCode("TEST_MULTIPLE_CHOICE").isEmpty()) {
            exerciseTypeRepository.save(ExerciseTypeEntity.builder().code("TEST_MULTIPLE_CHOICE").description("Chọn đáp án").build());
        }
        if (exerciseTypeRepository.findByCode("TEST_INTERACTIVE").isEmpty()) {
            exerciseTypeRepository.save(ExerciseTypeEntity.builder().code("TEST_INTERACTIVE").description("Tương tác").build());
        }
    }

    // ==================== MAI-EXT-001 ====================
    @Test
    @DisplayName("MAI-EXT-001: getExerciseTypes - Lấy danh sách thành công")
    void getExerciseTypes_WithData_ShouldReturnList() {
        // === DATA ===
        setupExerciseTypes();

        // === ACTION ===
        List<ExerciseTypeResponse> result = exerciseTypeService.getExerciseTypes();

        // === CHECK DB ===
        assertNotNull(result);
        assertTrue(result.stream().anyMatch(r -> r.getCode().equals("TEST_MULTIPLE_CHOICE")));
    }

    // ==================== MAI-EXT-002 ====================
    @Test
    @DisplayName("MAI-EXT-002: getExerciseTypes - Kiểm tra tính đúng đắn của mapping dữ liệu")
    void getExerciseTypes_VerifyDataMapping() {
        // === DATA ===
        setupExerciseTypes();

        // === ACTION ===
        List<ExerciseTypeResponse> result = exerciseTypeService.getExerciseTypes();

        // === CHECK: Verify mapping trường code và description ===
        ExerciseTypeResponse mc = result.stream()
                .filter(r -> r.getCode().equals("TEST_MULTIPLE_CHOICE"))
                .findFirst().get();
        assertEquals("Chọn đáp án", mc.getDescription());
    }

}
