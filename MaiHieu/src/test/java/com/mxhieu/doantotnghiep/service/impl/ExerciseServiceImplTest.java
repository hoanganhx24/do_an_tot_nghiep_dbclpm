package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test cho ExerciseServiceImpl sử dụng MySQL.
 *
 * Nghiệp vụ (Docs đồ án):
 * - Quản lý bài tập trong bài giảng: Cho phép giáo viên tạo các loại bài tập (Trắc nghiệm, Tương tác).
 * - Bài tập tương tác (Interactive): Xuất hiện tại một thời điểm (Showtime) trong video bài giảng.
 * - Hiển thị tiến độ: Học sinh xem lại bài tập đã làm sẽ thấy các đáp án mình đã chọn.
 *
 * Liên kết System Test:
 * - QLBTKH-VD-07: Kiểm tra validate thời gian xuất hiện bài tập tương tác không được vượt quá độ dài video.
 * - QLBTKH-FU-01: Kiểm tra hiển thị đúng thông tin bài tập từ cơ sở dữ liệu.
 *
 * Cấu trúc kiểm thử: DATA -> ACTION -> CHECK DB -> ROLLBACK.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExerciseServiceImplTest {

    @Autowired
    private ExerciseServiceImpl exerciseService;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private MediaAssetRepository mediaAssetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ChoiceRepository choiceRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private AttemptAnswerRepository attemptAnswerRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TrackRepository trackRepository;

    // =========================================================================
    // MAIN TEST CASES
    // =========================================================================

    @Test
    @DisplayName("MAI-EXS-001: getExerciseDetailById - Lấy chi tiết thành công")
    void getExerciseDetailById_Success_ShouldReturnDetail() {
        // === DATA: Tạo bài giảng và 1 bài tập trắc nghiệm ===
        LessonEntity lesson = createBaseLesson();
        ExerciseEntity exercise = createExercise(lesson, "MULTIPLE_CHOICE", "Simple Quiz");

        // === ACTION: Lấy thông tin chi tiết bài tập ===
        ExerciseResponse response = exerciseService.getExerciseDetailById(exercise.getId());

        // === CHECK DB: Verify thông tin trả về khớp với dữ liệu đã lưu ===
        assertNotNull(response);
        assertEquals("Simple Quiz", response.getTitle());
    }

    @Test
    @DisplayName("MAI-EXS-002: getExerciseDetailById - Exercise không tồn tại -> Ném EXERCISE_NOT_FOUND")
    void getExerciseDetailById_NotFound_ShouldThrow() {
        // === ACTION & CHECK ===
        AppException ex = assertThrows(AppException.class, () -> exerciseService.getExerciseDetailById(999999));
        assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("MAI-EXS-003: getExerciseDetailById (Học sinh) - Hiển thị lựa chọn đã làm")
    void getExerciseDetailById_WithStudentProgress_ShouldMarkSelected() {
        // === DATA: Thiết lập bài tập, câu hỏi và đáp án đã chọn ===
        LessonEntity lesson = createBaseLesson();
        ExerciseEntity exercise = createExercise(lesson, "MULTIPLE_CHOICE", "Quiz With Result");
        exercise.setQuestions(new ArrayList<>());
        exercise = exerciseRepository.saveAndFlush(exercise);

        QuestionEntity q = new QuestionEntity();
        q.setExercise(exercise);
        q.setQuestionText("Q1");
        q = questionRepository.saveAndFlush(q);
        exercise.getQuestions().add(q);

        q.setChoices(new ArrayList<>());
        ChoiceEntity c = new ChoiceEntity();
        c.setQuestion(q);
        c.setContent("Option A");
        c.setIsCorrect(true);
        c = choiceRepository.saveAndFlush(c);
        q.getChoices().add(c);

        StudentProfileEntity student = createStudent();
        
        // Giả lập hành vi học sinh đã làm bài (Attempt)
        AttemptEntity attempt = new AttemptEntity();
        attempt.setStudentProfile(student);
        attempt.setExercise(exercise);
        attempt = attemptRepository.saveAndFlush(attempt);

        // Lưu câu trả lời của học sinh (AttemptAnswer)
        AttemptAnswerEntity answer = new AttemptAnswerEntity();
        answer.setAttempt(attempt);
        answer.setQuestion(q);
        answer.setChoice(c);
        answer.setIsCorrect(true);
        attemptAnswerRepository.saveAndFlush(answer);

        // === ACTION: Lấy chi tiết bài tập theo studentProfileId ===
        ExerciseResponse response = exerciseService.getExerciseDetailById(exercise.getId(), student.getId());

        // === CHECK DB: Kiểm tra cờ isCompleted và trạng thái lựa chọn ===
        assertTrue(response.getIsCompleted(), "Bài tập phải được đánh dấu là đã hoàn thành");
        assertEquals("Option A", response.getQuestions().get(0).getChoices().get(0).getContent());
        // Logic nghiệp vụ: Choice nào học sinh đã chọn phải có selected = true
        assertTrue(response.getQuestions().get(0).getChoices().get(0).getSelected(), "Đáp án đã chọn phải được highlight");
    }

    @Test
    @DisplayName("MAI-EXS-004: createExercise - Showtime > thời lượng video -> Ném SHOWTIME_INVALID")
    void createExercise_ShowtimeTooLarge_ShouldThrow() {
        // === DATA: Bài giảng có video dài 100 giây ===
        LessonEntity lesson = createBaseLesson();
        createMediaAsset(lesson, 100);

        ExerciseRequest request = new ExerciseRequest();
        request.setLessonID(lesson.getId());
        request.setType("INTERACTIVE");
        request.setTitle("Pop-up Quiz");
        request.setShowTime(LocalTime.of(0, 2, 0)); // 120 giây (Lỗi: > 100 giây)

        // === ACTION + CHECK: Verify hệ thống chặn tạo bài tập sai logic thời gian ===
        AppException ex = assertThrows(AppException.class, () -> exerciseService.createExercise(request));
        assertEquals(ErrorCode.SHOWTIME_INVALID, ex.getErrorCode(), "Phải ném lỗi khi thời gian xuất hiện bài tập lớn hơn video");
    }

    @Test
    @DisplayName("MAI-EXS-005: createExercise - Trùng Showtime tương tác -> Ném SHOWTIME_EXISTED")
    void createExercise_DuplicateShowtime_ShouldThrow() {
        // === DATA: Đã có bài tập tương tác tại giây thứ 10 ===
        LessonEntity lesson = createBaseLesson();
        createMediaAsset(lesson, 500);

        ExerciseEntity existing = createExercise(lesson, "INTERACTIVE", "Existing Quiz");
        existing.setShowTime(LocalTime.of(0, 0, 10));
        exerciseRepository.saveAndFlush(existing);

        ExerciseRequest request = new ExerciseRequest();
        request.setLessonID(lesson.getId());
        request.setType("INTERACTIVE");
        request.setShowTime(LocalTime.of(0, 0, 10)); // Trùng giây 10

        // === ACTION & CHECK ===
        AppException ex = assertThrows(AppException.class, () -> exerciseService.createExercise(request));
        assertEquals(ErrorCode.SHOWTIME_EXISTED, ex.getErrorCode());
    }

    @Test
    @DisplayName("MAI-EXS-006: updateExercise - Cập nhật Title thành công")
    void updateExercise_Title_ShouldUpdate() {
        // === DATA ===
        LessonEntity lesson = createBaseLesson();
        ExerciseEntity exercise = createExercise(lesson, "MULTIPLE_CHOICE", "Old Title");

        ExerciseRequest request = new ExerciseRequest();
        request.setId(exercise.getId());
        request.setTitle("New Refined Title");

        // === ACTION ===
        exerciseService.updateExercise(request);

        // === CHECK DB ===
        ExerciseEntity updated = exerciseRepository.findById(exercise.getId()).get();
        assertEquals("New Refined Title", updated.getTitle());
    }

    @Test
    @DisplayName("MAI-EXS-007: getExerciseDetailsByLessonIdForStudent - Chỉ lấy bài tập thường")
    void getExerciseDetailsByLessonIdForStudent_ShouldFilterInteractive() {
        // === DATA: Bài giảng có 1 bài tập trắc nghiệm và 1 bài tập tương tác ===
        LessonEntity lesson = createBaseLesson();
        
        // 1. Bài tập trắc nghiệm (Normal)
        createExercise(lesson, "MULTIPLE_CHOICE", "Normal Quiz");
        
        // 2. Bài tập tương tác (Interactive)
        createExercise(lesson, "INTERACTIVE", "Interactive Quiz");

        // === ACTION: Học sinh lấy danh sách bài tập của bài giảng ===
        // Theo thiết kế, API này chỉ trả về bài tập "thường" (không phải tương tác)
        List<ExerciseResponse> result = exerciseService.getExerciseDetailsByLessonIdForStudent(lesson.getId(), 1);

        // === CHECK DB: Verify danh sách chỉ có 1 phần tử và không chứa loại INTERACTIVE ===
        assertEquals(1, result.size());
        assertNotEquals("INTERACTIVE", result.get(0).getTypeCode(), "Danh sách bài tập thường không được chứa bài tập tương tác");
    }

    // =========================================================================
    // HELPER METHODS (Dùng để rút gọn code khởi tạo lặp lại)
    // =========================================================================

    private void setupExerciseTypes() {
        if (exerciseTypeRepository.findByCode("MULTIPLE_CHOICE").isEmpty()) {
            ExerciseTypeEntity type = new ExerciseTypeEntity();
            type.setCode("MULTIPLE_CHOICE");
            type.setDescription("Trắc nghiệm");
            exerciseTypeRepository.saveAndFlush(type);
        }
        if (exerciseTypeRepository.findByCode("INTERACTIVE").isEmpty()) {
            ExerciseTypeEntity type = new ExerciseTypeEntity();
            type.setCode("INTERACTIVE");
            type.setDescription("Tương tác");
            exerciseTypeRepository.saveAndFlush(type);
        }
    }

    private LessonEntity createBaseLesson() {
        setupExerciseTypes();
        TeacherprofileEntity teacher = createTeacher();
        
        TrackEntity track = trackRepository.findByCode("EXS-TRACK").orElseGet(() -> {
            TrackEntity t = new TrackEntity();
            t.setCode("EXS-TRACK");
            t.setName("Test Track");
            return trackRepository.saveAndFlush(t);
        });

        CourseEntity course = new CourseEntity();
        course.setTitle("Exercise Course");
        course.setTrack(track);
        course.setTeacherprofile(teacher);
        course = courseRepository.saveAndFlush(course);

        ModuleEntity module = new ModuleEntity();
        module.setTitle("Exercise Module");
        module.setCourse(course);
        module.setType(ModuleType.LESSON);
        module = moduleRepository.saveAndFlush(module);

        LessonEntity lesson = new LessonEntity();
        lesson.setTitle("Integration Exercise Lesson");
        lesson.setModule(module);
        lesson.setMediaassets(new ArrayList<>());
        return lessonRepository.saveAndFlush(lesson);
    }

    private ExerciseEntity createExercise(LessonEntity lesson, String typeCode, String title) {
        ExerciseEntity exercise = new ExerciseEntity();
        exercise.setLesson(lesson);
        exercise.setTitle(title);
        exercise.setExercisetype(exerciseTypeRepository.findByCode(typeCode).get());
        return exerciseRepository.saveAndFlush(exercise);
    }

    private MediaAssetEntity createMediaAsset(LessonEntity lesson, int lengthSec) {
        MediaAssetEntity media = new MediaAssetEntity();
        media.setLesson(lesson);
        media.setLengthSec(lengthSec);
        media = mediaAssetRepository.saveAndFlush(media);
        if (lesson.getMediaassets() == null) lesson.setMediaassets(new ArrayList<>());
        lesson.getMediaassets().add(media);
        return media;
    }

    private StudentProfileEntity createStudent() {
        UserEntity user = new UserEntity();
        user.setEmail("std_exs_" + System.currentTimeMillis() + "@test.com");
        user.setStatus("ACTIVE");
        user = userRepository.saveAndFlush(user);
        StudentProfileEntity student = new StudentProfileEntity();
        student.setUser(user);
        return studentProfileRepository.saveAndFlush(student);
    }

    private TeacherprofileEntity createTeacher() {
        UserEntity user = new UserEntity();
        user.setEmail("tea_exs_" + System.currentTimeMillis() + "@test.com");
        user.setStatus("ACTIVE");
        user = userRepository.saveAndFlush(user);
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(user);
        return teacheprofileRepository.saveAndFlush(teacher);
    }
}
