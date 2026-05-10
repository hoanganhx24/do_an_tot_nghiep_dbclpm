package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AssessmentRequest;
import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.AssessmentRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test cho AssessmentServiceImpl sử dụng MySQL (Dump).
 *
 * Quản lý Assessment (bài tập đánh giá trong bài test).
 * Theo docs bảng 2.18: Assessment gắn với Test, chứa câu hỏi đánh giá.
 * UC 2.3.3, 2.3.4: Admin thêm bài test và câu hỏi.
 *
 * Liên kết System Test:
 * - QLBTKH-VD-01: Kiểm tra bỏ trống trường bắt buộc.
 * - QLBTKH-VD-02: Kiểm tra trim dấu space (khoảng trắng).
 * - QLBTKH-FU-03: Hiển thị danh sách bài tập của bài test.
 * - QLBTKH-FU-07: Thêm bài tập thành công.
 * - QLBTKH-FU-34: Xóa bài tập thành công.
 *
 * Cấu trúc test: DATA -> ACTION -> CHECK DB -> ROLLBACK
 * Method tested: createAssessment, updateAssessment, deleteAssessmentById, 
 *                getSummaryAssessmentsByTestId, getAssessmentDetailForFistTest,
 *                getAssessmentDetailById, getAssessmentsDetailByTestId.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AssessmentServiceImplTest {

    @Autowired
    private AssessmentServiceImpl assessmentService;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    private TestEntity existingTest;
    private ExerciseTypeEntity existingType;

    @BeforeEach
    void setUp() {
        // Lấy dữ liệu từ dump để đảm bảo môi trường thực tế
        existingTest = testRepository.findAll().stream()
                .filter(t -> t.getAssessments() != null)
                .findFirst()
                .orElseGet(() -> {
                    TestEntity t = TestEntity.builder().name("Test Dump").type("FIRST_TEST").assessments(new ArrayList<>()).build();
                    return testRepository.save(t);
                });
        
        existingType = exerciseTypeRepository.findByCode("MULTIPLE_CHOICE").orElseGet(() -> 
            exerciseTypeRepository.save(ExerciseTypeEntity.builder().code("MULTIPLE_CHOICE").description("Trắc nghiệm").build()));
    }

    // ==================== MAI-ASS-001 ====================
    @Test
    @DisplayName("MAI-ASS-001: Tạo Assessment thành công (QLBTKH-FU-07)")
    void createAssessment_Success() {
        // 1. DATA
        AssessmentRequest request = new AssessmentRequest();
        request.setTestId(existingTest.getId());
        request.setType(existingType.getCode());
        request.setTitle("Bài tập thực tế");

        // 2. ACTION
        assessmentService.createAssessment(request);

        // 3. CHECK DB
        AssessmentEntity saved = assessmentRepository.findAll().stream()
                .filter(a -> "Bài tập thực tế".equals(a.getTitle()))
                .findFirst().orElse(null);
        
        assertNotNull(saved);
        assertEquals(existingTest.getId(), saved.getTest().getId());
        assertEquals(existingType.getCode(), saved.getExercisetype().getCode());
    }

    // ==================== MAI-ASS-002 ====================
    @Test
    @DisplayName("MAI-ASS-002: Kiểm tra trim space tiêu đề (System Test QLBTKH-VD-02)")
    void createAssessment_ShouldTrimTitle() {
        // 1. DATA
        AssessmentRequest request = new AssessmentRequest();
        request.setTestId(existingTest.getId());
        request.setType(existingType.getCode());
        request.setTitle("   Tiêu đề có khoảng trắng   ");

        // 2. ACTION
        assessmentService.createAssessment(request);

        // 3. CHECK DB
        AssessmentEntity saved = assessmentRepository.findAll().stream()
                .filter(a -> a.getTitle() != null && a.getTitle().contains("Tiêu đề có khoảng trắng"))
                .findFirst().orElse(null);
        
        assertNotNull(saved, "Không tìm thấy Assessment vừa tạo");
        // Nếu FAIL nghĩa là chưa trim (expected: "Tiêu đề có khoảng trắng", actual: "   Tiêu đề có khoảng trắng   ")
        assertEquals("Tiêu đề có khoảng trắng", saved.getTitle(), 
                "Lỗi QLBTKH-VD-02: Hệ thống chưa trim space tiêu đề bài tập khi lưu DB");
    }

    // ==================== MAI-ASS-003 ====================
    @Test
    @DisplayName("MAI-ASS-003: Tạo Assessment - Test không tồn tại - Throw Exception")
    void createAssessment_TestNotFound_ShouldThrow() {
        AssessmentRequest request = new AssessmentRequest();
        request.setTestId(99999); // ID ảo
        request.setType(existingType.getCode());
        request.setTitle("Test Fail");

        AppException ex = assertThrows(AppException.class, () -> assessmentService.createAssessment(request));
        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-ASS-004 ====================
    @Test
    @DisplayName("MAI-ASS-004: Cập nhật tiêu đề Assessment (Partial Update)")
    void updateAssessment_TitleOnly_Success() {
        // 1. DATA: Tạo 1 assessment trước
        AssessmentEntity a = AssessmentEntity.builder()
                .title("Old Title")
                .test(existingTest)
                .exercisetype(existingType)
                .build();
        a = assessmentRepository.save(a);

        AssessmentRequest request = new AssessmentRequest();
        request.setId(a.getId());
        request.setTitle("New Title");

        // 2. ACTION
        assessmentService.updateAssessment(request);

        // 3. CHECK DB
        AssessmentEntity updated = assessmentRepository.findById(a.getId()).orElseThrow();
        assertEquals("New Title", updated.getTitle());
    }

    // ==================== MAI-ASS-005 ====================
    @Test
    @DisplayName("MAI-ASS-005: Xóa Assessment theo ID (QLBTKH-FU-34)")
    void deleteAssessment_Success() {
        // 1. DATA
        AssessmentEntity a = AssessmentEntity.builder()
                .title("To delete")
                .test(existingTest)
                .exercisetype(existingType)
                .build();
        a = assessmentRepository.save(a);
        Integer id = a.getId();

        // 2. ACTION
        assessmentService.deleteAssessmentById(id);

        // 3. CHECK DB
        assertFalse(assessmentRepository.existsById(id));
    }

    // ==================== MAI-ASS-006 ====================
    @Test
    @DisplayName("MAI-ASS-006: Lấy danh sách summary theo Test ID (QLBTKH-FU-03)")
    void getSummaryAssessmentsByTestId_Success() {
        // 1. DATA: Tạo 2 assessment cho cùng 1 test
        assessmentRepository.save(AssessmentEntity.builder().title("A1").test(existingTest).exercisetype(existingType).build());
        assessmentRepository.save(AssessmentEntity.builder().title("A2").test(existingTest).exercisetype(existingType).build());

        // 2. ACTION
        List<AssessmentResponse> results = assessmentService.getSummaryAssessmentsByTestId(existingTest.getId());

        // 3. CHECK
        assertNotNull(results);
        assertTrue(results.size() >= 2);
    }

    // ==================== MAI-ASS-007 ====================
    @Test
    @DisplayName("MAI-ASS-007: Lấy bài test đầu vào (Điều kiện >= 10 câu hỏi)")
    void getAssessmentDetailForFirstTest_Success() {
        // 1. DATA: Đảm bảo có ít nhất 1 test loại FIRST_TEST có >= 10 câu hỏi
        TestEntity firstTest = TestEntity.builder()
                .name("Final Entrance Test")
                .type("FIRST_TEST")
                .assessments(new ArrayList<>())
                .build();
        firstTest = testRepository.save(firstTest);

        AssessmentEntity a = AssessmentEntity.builder()
                .title("Core Part")
                .test(firstTest)
                .exercisetype(existingType)
                .assessmentQuestions(new ArrayList<>()) 
                .build();
        a = assessmentRepository.save(a);
        firstTest.getAssessments().add(a); 
        
        // Thêm 10 câu hỏi
        for(int i=0; i<10; i++) {
            AssessmentQuestionEntity q = AssessmentQuestionEntity.builder()
                    .stem("Q"+i)
                    .assessment(a)
                    .assessmentOptions(new ArrayList<>()) // Fix NPE here
                    .build();
            a.getAssessmentQuestions().add(q);
        }
        assessmentRepository.save(a);

        // 2. ACTION
        List<AssessmentResponse> results = assessmentService.getAssessmentDetailForFistTest();

        // 3. CHECK
        assertNotNull(results, "Kết quả trả về không được null");
        assertFalse(results.isEmpty(), "Danh sách trả về không được rỗng");

        // Lấy TestID từ kết quả trả về
        Integer returnedTestId = results.get(0).getTestId();
        
        // Truy vấn ngược lại DB để kiểm tra tổng số câu hỏi của bài test này
        TestEntity testInDb = testRepository.findById(returnedTestId).orElse(null);
        assertNotNull(testInDb, "Bài test trả về phải tồn tại trong DB");

        int totalQuestions = testInDb.getAssessments().stream()
                .mapToInt(as -> as.getAssessmentQuestions().size())
                .sum();

        assertTrue(totalQuestions >= 10, 
            "Lỗi logic: Bài test có ID " + returnedTestId + " chỉ có " + totalQuestions + " câu hỏi (Kỳ vọng >= 10)");
    }

    // ==================== MAI-ASS-008 ====================
    @Test
    @DisplayName("MAI-ASS-008: Lấy chi tiết Assessment theo ID")
    void getAssessmentDetailById_Success() {
        AssessmentEntity a = AssessmentEntity.builder()
                .title("Detail Test")
                .test(existingTest)
                .exercisetype(existingType)
                .assessmentQuestions(new ArrayList<>()) 
                .build();
        a = assessmentRepository.save(a);

        AssessmentResponse response = assessmentService.getAssessmentDetailById(a.getId());

        assertNotNull(response);
        assertEquals("Detail Test", response.getTitle());
    }

    // ==================== MAI-ASS-009 ====================
    @Test
    @DisplayName("MAI-ASS-009: Lấy Assessment detail theo Test ID")
    void getAssessmentsDetailByTestId_Success() {
        // 1. DATA: Tạo một Assessment với tiêu đề độc nhất
        String uniqueTitle = "Detail List Test Unique " + System.currentTimeMillis();
        AssessmentEntity a = AssessmentEntity.builder()
                .title(uniqueTitle)
                .test(existingTest)
                .exercisetype(existingType)
                .assessmentQuestions(new ArrayList<>()) 
                .build();
        assessmentRepository.save(a);

        // 2. ACTION
        List<AssessmentResponse> results = assessmentService.getAssessmentsDetailByTestId(existingTest.getId());

        // 3. CHECK
        assertNotNull(results, "Kết quả không được null");
        assertFalse(results.isEmpty(), "Danh sách không được rỗng");
        
        // Kiểm tra xem trong danh sách trả về có chứa đúng cái Assessment mình vừa tạo không
        boolean found = results.stream()
                .anyMatch(r -> uniqueTitle.equals(r.getTitle()));
        
        assertTrue(found, "Không tìm thấy Assessment vừa tạo trong danh sách trả về của Test ID: " + existingTest.getId());
    }

    // ==================== NEGATIVE CASES ====================

    // ==================== MAI-ASS-010 ====================
    @Test
    @DisplayName("MAI-ASS-010: Tạo Assessment với tiêu đề trống (QLBTKH-VD-01)")
    void createAssessment_EmptyTitle_ShouldThrow() {
        // 1. DATA
        AssessmentRequest request = new AssessmentRequest();
        request.setTestId(existingTest.getId());
        request.setType(existingType.getCode());
        request.setTitle(""); // Trống

        // 2. ACTION & CHECK
        // Hiện tại code chưa check, nên test này có thể FAIL nếu expect Exception.
        // Tuy nhiên theo System Test QLBTKH-VD-01, hệ thống phải báo lỗi.
        AppException ex = assertThrows(AppException.class, () -> assessmentService.createAssessment(request));
        // Nếu sụp đổ ở đây nghĩa là logic chưa implement validation
    }

    // ==================== MAI-ASS-011 ====================
    @Test
    @DisplayName("MAI-ASS-011: Tạo Assessment với ExerciseType không tồn tại")
    void createAssessment_TypeNotFound_ShouldThrow() {
        AssessmentRequest request = new AssessmentRequest();
        request.setTestId(existingTest.getId());
        request.setType("INVALID_TYPE");
        request.setTitle("Fail Type");

        AppException ex = assertThrows(AppException.class, () -> assessmentService.createAssessment(request));
        assertEquals(ErrorCode.EXERCISE_TYPE_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-ASS-012 ====================
    @Test
    @DisplayName("MAI-ASS-012: Cập nhật Assessment không tồn tại")
    void updateAssessment_NotFound_ShouldThrow() {
        AssessmentRequest request = new AssessmentRequest();
        request.setId(99999);
        request.setTitle("Non-existent");

        AppException ex = assertThrows(AppException.class, () -> assessmentService.updateAssessment(request));
        assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-ASS-013 ====================
    @Test
    @DisplayName("MAI-ASS-013: Lấy chi tiết Assessment không tồn tại")
    void getAssessmentDetailById_NotFound_ShouldThrow() {
        AppException ex = assertThrows(AppException.class, () -> assessmentService.getAssessmentDetailById(99999));
        assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-ASS-014 ====================
    @Test
    @DisplayName("MAI-ASS-014: Lấy bài test đầu vào khi không có test nào thỏa mãn (RuntimeEx)")
    void getAssessmentDetailForFirstTest_NoTest_ShouldThrow() {
        // Xóa tạm thời các test loại FIRST_TEST trong session này (nhờ @Transactional rollback)
        testRepository.findAll().stream()
                .filter(t -> "FIRST_TEST".equals(t.getType()))
                .forEach(t -> {
                    t.setType("OTHER");
                    testRepository.save(t);
                });

        RuntimeException ex = assertThrows(RuntimeException.class, () -> assessmentService.getAssessmentDetailForFistTest());
        assertEquals("No test found", ex.getMessage());
    }
}
