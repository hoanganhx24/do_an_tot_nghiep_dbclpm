package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AssessmentOptionRequest;
import com.mxhieu.doantotnghiep.dto.request.AssessmentQuestionRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.AssessmentOptionRepository;
import com.mxhieu.doantotnghiep.repository.AssessmentQuestionRepository;
import com.mxhieu.doantotnghiep.repository.AssessmentRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test cho AssessmentQuestionAndChoiceServiceImpl sử dụng MySQL thực tế (Dump).
 *
 * Quản lý Câu hỏi và Lựa chọn (AssessmentQuestion và AssessmentOption).
 * Theo docs:
 * - Bảng 2.19: AssessmentQuestion gắn với Assessment.
 * - Bảng 2.20: AssessmentOption gắn với AssessmentQuestion.
 * UC 2.3.4: Quản trị viên thêm/sửa/xóa câu hỏi cho bài tập.
 *
 * Liên kết System Test:
 * - QLBTKH-VD-10: Kiểm tra tính duy nhất của đáp án (Duplicate Options).
 * - QLBTKH-VD-12: Kiểm tra tính hợp lệ của ô tích đáp án đúng.
 * - QLBTKH-FU-16 -> QLBTKH-FU-24: Thêm câu hỏi cho từng loại bài tập (MC, TF, Listening...).
 * - QLBTKH-FU-25 -> QLBTKH-FU-33: Sửa câu hỏi cho từng loại bài tập.
 * - QLBTKH-FU-35: Xóa câu hỏi thành công.
 *
 * Cấu trúc test: DATA -> ACTION -> CHECK DB -> ROLLBACK
 * Method tested: createQuestionAndChoices, updateQuestionndChoices, deleteAssessmentQuestionById.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AssessmentQuestionAndChoiceServiceImplTest {

    @Autowired
    private AssessmentQuestionAndChoiceServiceImpl service;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentQuestionRepository assessmentQuestionRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    @Autowired
    private AssessmentOptionRepository assessmentOptionRepository;

    private AssessmentEntity assessmentMC;
    private AssessmentEntity assessmentTF;
    private AssessmentEntity assessmentList;
    private AssessmentEntity assessmentBlank;

    @BeforeEach
    void setUp() {
        // Lấy ExerciseType từ dump
        ExerciseTypeEntity mcType = exerciseTypeRepository.findByCode("MULTIPLE_CHOICE").orElseThrow();
        ExerciseTypeEntity tfType = exerciseTypeRepository.findByCode("TRUE_FALSE").orElseThrow();
        ExerciseTypeEntity listType = exerciseTypeRepository.findByCode("LISTENING_1").orElseThrow();
        ExerciseTypeEntity blankType = exerciseTypeRepository.findByCode("FILL_IN_THE_BLANK").orElseThrow();

        // Tạo Assessment mới phục vụ test (sẽ được rollback)
        assessmentMC = assessmentRepository.save(AssessmentEntity.builder().title("Test MC").exercisetype(mcType).build());
        assessmentTF = assessmentRepository.save(AssessmentEntity.builder().title("Test TF").exercisetype(tfType).build());
        assessmentList = assessmentRepository.save(AssessmentEntity.builder().title("Test List").exercisetype(listType).build());
        assessmentBlank = assessmentRepository.save(AssessmentEntity.builder().title("Test Blank").exercisetype(blankType).build());
    }

    // Lấy câu hỏi vừa tạo dựa trên Assessment ID
    private AssessmentQuestionEntity getLatestQuestion(Integer assessmentId) {
        return assessmentQuestionRepository.findAll().stream()
                .filter(q -> q.getAssessment().getId().equals(assessmentId))
                .findFirst()
                .orElse(null);
    }

    // ==================== MAI-AQC-001 ====================
    @Test
    @DisplayName("MAI-AQC-001: Tạo câu hỏi MULTIPLE_CHOICE hợp lệ (QLBTKH-FU-17)")
    void createQuestionAndChoices_MultipleChoice_Success() {
        // 1. DATA
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentMC.getId());
        request.setQuestion("Hệ quản trị CSDL nào được dùng trong đồ án?");
        request.setOptions(List.of("MySQL", "PostgreSQL", "MongoDB", "Oracle"));
        request.setAnswer("MySQL");

        // 2. ACTION
        service.createQuestionAndChoices(request, null);

        // 3. CHECK DB
        AssessmentQuestionEntity saved = getLatestQuestion(assessmentMC.getId());
        assertNotNull(saved);
        assertEquals(4, saved.getAssessmentOptions().size());
        assertTrue(saved.getAssessmentOptions().stream().anyMatch(o -> o.getContent().equals("MySQL") && o.getIsCorrect()));
    }

    // ==================== MAI-AQC-002 ====================
    @Test
    @DisplayName("MAI-AQC-002: Tạo câu hỏi TRUE_FALSE - tự động sinh option (QLBTKH-FU-16)")
    void createQuestionAndChoices_TrueFalse_Success() {
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentTF.getId());
        request.setQuestion("Java là ngôn ngữ hướng đối tượng?");
        request.setAnswer("True");

        service.createQuestionAndChoices(request, null);

        AssessmentQuestionEntity saved = getLatestQuestion(assessmentTF.getId());
        assertNotNull(saved);
        assertEquals(2, saved.getAssessmentOptions().size());
        assertTrue(saved.getAssessmentOptions().stream().anyMatch(o -> o.getContent().equals("True") && o.getIsCorrect()));
    }

    // ==================== MAI-AQC-003 ====================
    @Test
    @DisplayName("MAI-AQC-003: Kiểm tra trim space (System Test QLBTKH-VD-02)")
    void createQuestionAndChoices_ShouldTrimSpace() {
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentMC.getId());
        request.setQuestion("   Question   "); 
        request.setOptions(List.of(" A ", " B "));
        request.setAnswer(" A ");

        service.createQuestionAndChoices(request, null);

        AssessmentQuestionEntity saved = getLatestQuestion(assessmentMC.getId());
        assertNotNull(saved);
        assertEquals("Question", saved.getStem(), "Lỗi: Nội dung câu hỏi chưa được trim space");
        assertEquals("A", saved.getAssessmentOptions().get(0).getContent(), "Lỗi: Đáp án chưa được trim space");
    }

    // ==================== MAI-AQC-004 ====================
    @Test
    @DisplayName("MAI-AQC-004: Tạo câu hỏi LISTENING_1 với file tranh (QLBTKH-FU-19)")
    void createQuestionAndChoices_Listening_WithFile() throws Exception {
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentList.getId());
        request.setQuestion("Look at the picture");
        request.setOptions(List.of("A", "B", "C", "D"));
        request.setAnswer("A");
        
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image content".getBytes());

        service.createQuestionAndChoices(request, file);

        AssessmentQuestionEntity saved = getLatestQuestion(assessmentList.getId());
        assertNotNull(saved);
        assertArrayEquals("image content".getBytes(), saved.getMediData());
    }

    // ==================== MAI-AQC-005 ====================
    @Test
    @DisplayName("MAI-AQC-005: Cập nhật câu hỏi và thay đổi options (QLBTKH-FU-26)")
    void updateQuestionAndChoices_Success() {
        AssessmentQuestionEntity q = assessmentQuestionRepository.save(AssessmentQuestionEntity.builder()
                .assessment(assessmentMC).stem("Old Q").assessmentOptions(new ArrayList<>()).build());
        AssessmentOptionEntity o1 = assessmentOptionRepository.save(AssessmentOptionEntity.builder()
                .assessmentQuestion(q).content("Old A").isCorrect(true).build());
        q.getAssessmentOptions().add(o1);

        AssessmentOptionRequest optReq = new AssessmentOptionRequest();
        optReq.setId(o1.getId());
        optReq.setContent("New A");

        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setId(q.getId());
        request.setQuestion("New Q");
        request.setChoices(List.of(optReq));
        request.setAnswer("New A");

        service.updateQuestionndChoices(request, null);

        AssessmentQuestionEntity updated = assessmentQuestionRepository.findById(q.getId()).orElseThrow();
        assertEquals("New Q", updated.getStem());
        assertEquals("New A", updated.getAssessmentOptions().get(0).getContent());
    }

    // ==================== MAI-AQC-006 ====================
    @Test
    @DisplayName("MAI-AQC-006: Xóa câu hỏi (QLBTKH-FU-35)")
    void deleteQuestion_Success() {
        AssessmentQuestionEntity q = assessmentQuestionRepository.save(AssessmentQuestionEntity.builder()
                .assessment(assessmentMC).stem("Delete me").build());
        Integer id = q.getId();

        service.deleteAssessmentQuestionById(id);

        assertFalse(assessmentQuestionRepository.existsById(id));
    }

    // ==================== MAI-AQC-007 ====================
    @Test
    @DisplayName("MAI-AQC-007: Kiểm tra tính duy nhất của đáp án (QLBTKH-VD-10)")
    void createQuestionAndChoices_DuplicateOptions_ShouldFail() {
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentMC.getId());
        request.setQuestion("Duplicate test");
        request.setOptions(List.of("MySQL", "MySQL")); 
        request.setAnswer("MySQL");

        assertThrows(AppException.class, () -> service.createQuestionAndChoices(request, null),
                "Lỗi: Hệ thống chưa chặn đáp án trùng lặp (phải ném AppException)");
    }

    // ==================== MAI-AQC-008 ====================
    @Test
    @DisplayName("MAI-AQC-008: Tạo câu hỏi FILL_IN_THE_BLANK")
    void createQuestionAndChoices_FillInTheBlank_Success() {
        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setAssessmentId(assessmentBlank.getId());
        request.setQuestion("___ is a programming language.");
        request.setAnswer(List.of("Java", "C++")); // Nhiều đáp án đúng cho điền từ

        service.createQuestionAndChoices(request, null);

        AssessmentQuestionEntity saved = getLatestQuestion(assessmentBlank.getId());
        assertNotNull(saved);
        assertEquals(2, saved.getAssessmentOptions().size());
        assertTrue(saved.getAssessmentOptions().stream().allMatch(o -> o.getIsCorrect()));
    }

    // ==================== MAI-AQC-009 ====================
    @Test
    @DisplayName("MAI-AQC-009: Cập nhật câu hỏi và thêm option mới")
    void updateQuestionAndChoices_AddNewOption_Success() {
        AssessmentQuestionEntity q = assessmentQuestionRepository.save(AssessmentQuestionEntity.builder()
                .assessment(assessmentMC).stem("Update Q").assessmentOptions(new ArrayList<>()).build());
        
        AssessmentOptionRequest newOpt = new AssessmentOptionRequest();
        newOpt.setContent("Brand New Option");

        AssessmentQuestionRequest request = new AssessmentQuestionRequest();
        request.setId(q.getId());
        request.setChoices(List.of(newOpt));
        request.setAnswer("Brand New Option");

        service.updateQuestionndChoices(request, null);

        AssessmentQuestionEntity updated = assessmentQuestionRepository.findById(q.getId()).orElseThrow();
        assertEquals(1, updated.getAssessmentOptions().size());
        assertEquals("Brand New Option", updated.getAssessmentOptions().get(0).getContent());
    }
}
