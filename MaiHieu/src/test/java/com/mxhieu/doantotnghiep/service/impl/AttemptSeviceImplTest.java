package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.AttemptConverter;
import com.mxhieu.doantotnghiep.dto.request.AttemptRequest;
import com.mxhieu.doantotnghiep.dto.request.AttemptanswerRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho AttemptSeviceImpl (Lưu kết quả bài tập).
 *
 * Nghiệp vụ: Học sinh làm bài tập (Exercise) sau mỗi bài giảng (Lesson).
 * Theo đồ án Mục 2.3.18 (UC làm bài tập sau khi xem bài giảng) và Sơ đồ tuần tự 2.5.19.
 * Hệ thống thực hiện chấm điểm tự động dựa trên đáp án đúng/sai và lưu lịch sử làm bài (Attempt).
 *
 * Liên kết System Test (Module Học khóa học - Học sinh):
 * - HKH_FU_07: Kiểm tra chức năng làm bài tập sau khi xem xong video và lý thuyết.
 * - HKH_UI_20: Hiển thị lịch sử làm bài (Yêu cầu dữ liệu Attempt phải chính xác).
 * - QLBTKH-VD-01: Kiểm tra các trường bắt buộc (Validate danh sách câu trả lời).
 * - QLBTKH-VD-12: Kiểm tra tính hợp lệ của điểm số dựa trên đáp án đúng.
 *
 * Cấu trúc test: DATA → MOCK → ACTION → CHECK DB/DATA → ROLLBACK
 * Method tested: saveAttempt (bao gồm logic tinhDiem).
 */
@ExtendWith(MockitoExtension.class)
class AttemptSeviceImplTest {

    @Mock private AttemptRepository attemptRepository;
    @Mock private AttemptConverter attemptConverter;
    @Mock private QuestionRepository questionRepository;
    @Mock private AttemptAnswerRepository attemptAnswerRepository;
    @Mock private ChoiceRepository choiceRepository;
    @Mock private StudentProfileRepository studentProfileRepository;
    @Mock private ExerciseRepository exerciseRepository;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private AttemptSeviceImpl attemptService;

    private AttemptRequest request;
    private StudentProfileEntity student;
    private ExerciseEntity exercise;

    @BeforeEach
    void setUp() {
        request = new AttemptRequest();
        request.setStudentProfileId(1);
        request.setExerciseId(1);
        
        AttemptanswerRequest ans1 = new AttemptanswerRequest();
        ans1.setQuestionId(10);
        ans1.setChoiceId(100);
        
        request.setAttemptanswerRequests(List.of(ans1));

        student = new StudentProfileEntity();
        student.setId(1);

        exercise = new ExerciseEntity();
        exercise.setId(1);
    }

    // ==================== MAI-ATS-001 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-ATS-001: Lưu attempt thành công - tính điểm chính xác")
    void saveAttempt_ValidRequest_ShouldSaveAndCalculateScore() {
        // === DATA ===
        // Giả lập 1 câu hỏi với 1 đáp án đúng
        ChoiceEntity choice = new ChoiceEntity();
        choice.setId(100);
        choice.setIsCorrect(true); // Trả lời đúng -> Mong đợi 100% điểm

        QuestionEntity question = new QuestionEntity();
        question.setId(10);

        // === MOCK ===
        // Thiết lập các repository trả về dữ liệu mẫu để tránh ném exception NotFound
        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(student));
        when(exerciseRepository.findById(1)).thenReturn(Optional.of(exercise));
        when(choiceRepository.findById(100)).thenReturn(Optional.of(choice));
        when(questionRepository.findById(10)).thenReturn(Optional.of(question));

        // === ACTION ===
        // Thực thi nghiệp vụ lưu kết quả làm bài
        attemptService.saveAttempt(request);

        // === CHECK DB/DATA ===
        // Kiểm tra dữ liệu được lưu vào Database thông qua ArgumentCaptor
        ArgumentCaptor<AttemptEntity> captor = ArgumentCaptor.forClass(AttemptEntity.class);
        verify(attemptRepository).save(captor.capture());
        
        AttemptEntity saved = captor.getValue();
        // Kiểm tra tính chính xác của các mối liên kết (FK)
        assertEquals(student, saved.getStudentProfile());
        assertEquals(exercise, saved.getExercise());
        // Kiểm tra logic tính điểm: 1 đúng / 1 câu = 100% (Phù hợp QLBTKH-VD-12)
        assertEquals(100, saved.getScorePercent());
        assertEquals(1, saved.getAttemptAnswers().size());

        // === ROLLBACK ===
    }

    // ==================== MAI-ATS-002 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-ATS-002: Lưu attempt - list rỗng -> Phải ném ngoại lệ validation")
    void saveAttempt_EmptyAnswers_ShouldThrow() {
        // === DATA: Request nộp bài nhưng không chọn đáp án nào ===
        request.setAttemptanswerRequests(new ArrayList<>());

        // === ACTION + CHECK ===
        // PHÁT HIỆN BUG TỪ SYSTEM TEST: Code thực tế đang bị ArithmeticException (/ by zero)
        // Yêu cầu: Hệ thống phải validate và ném AppException(ErrorCode.LIST_EMPTY) hoặc tương đương (QLBTKH-VD-01).
        assertThrows(AppException.class, 
            () -> attemptService.saveAttempt(request), 
            "Hệ thống phải báo lỗi validate khi nộp bài tập mà danh sách câu trả lời rỗng");

        // === ROLLBACK ===
    }

    // ==================== MAI-ATS-003 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-ATS-003: Lưu attempt - Student không tồn tại -> ném exception")
    void saveAttempt_StudentNotFound_ShouldThrow() {
        // === DATA ===
        ChoiceEntity choice = new ChoiceEntity();
        choice.setId(100);
        choice.setIsCorrect(true);
        
        // === MOCK ===
        // Code hiện tại gọi tinhDiem() trước khi check student -> cần mock Choice
        when(choiceRepository.findById(100)).thenReturn(Optional.of(choice));
        // Mock không tìm thấy hồ sơ học sinh
        when(studentProfileRepository.findById(1)).thenReturn(Optional.empty());

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> attemptService.saveAttempt(request));
        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());

        // === ROLLBACK ===
    }

    // ==================== MAI-ATS-004 ====================
    @Test
    @Transactional
    @Rollback
    @DisplayName("MAI-ATS-004: Lưu attempt - Exercise không tồn tại -> ném exception")
    void saveAttempt_ExerciseNotFound_ShouldThrow() {
        // === DATA ===
        ChoiceEntity choice = new ChoiceEntity();
        choice.setId(100);
        choice.setIsCorrect(true);

        // === MOCK ===
        when(choiceRepository.findById(100)).thenReturn(Optional.of(choice));
        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(student));
        // Mock không tìm thấy bài tập tương ứng
        when(exerciseRepository.findById(1)).thenReturn(Optional.empty());

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> attemptService.saveAttempt(request));
        assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode());

        // === ROLLBACK ===
    }
}
