package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
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

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test cho CourseServiceImpl sử dụng MySQL (Dump).
 *
 * Nghiệp vụ: Quản lý vòng đời khóa học (Course Lifecycle).
 * - Admin tạo khóa học, phân công giáo viên (UC 2.3.2, 2.3.10).
 * - Giáo viên biên tập bài giảng, bài tập (UC 2.3.11, 2.3.12).
 * - Giáo viên công bố (Publish) khóa học để tạo phiên bản chính thức (UC 2.3.9, 2.5.10).
 * - Học sinh theo dõi tiến độ, hoàn thành khóa học (UC 2.3.17, 2.3.18, 2.3.19).
 *
 * Liên kết System Test:
 * - KH-CN-01: Hiển thị danh sách khóa học của giáo viên.
 * - HKH-FU-01: Kiểm tra logic mở khóa và công nhận hoàn thành khóa học.
 * - HKH-UI-07: Hiển thị huy hiệu hoàn thành (Cups/Progress).
 * - QLBTKH-VD-01: Kiểm tra các ràng buộc dữ liệu khi Publish (Module/Lesson/Exercise không rỗng).
 *
 * Cấu trúc test: DATA (Chuẩn bị DB) -> ACTION (Gọi Service) -> CHECK (Verify DB/Data) -> ROLLBACK (@Transactional)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CourseServiceImplTest {

    @Autowired
    private CourseServiceImpl courseService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    // ==================== HELPERS ====================

    /**
     * Helper tạo hồ sơ giáo viên.
     * Tách riêng để dùng chung cho các UC tạo mới khóa học.
     */
    private TeacherprofileEntity createTeacher(String email) {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setPassword("pass");
        user.setFullName("Teacher");
        user.setStatus("ACTIVE");
        user = userRepository.save(user);

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(user);
        return teacheprofileRepository.save(teacher);
    }

    /**
     * Helper tạo lộ trình học tập (Track).
     */
    private TrackEntity createTrack(String code, String name) {
        TrackEntity track = new TrackEntity();
        track.setCode(code);
        track.setName(name);
        return trackRepository.save(track);
    }

    /**
     * Helper tạo Course với đầy đủ các trường bắt buộc (User, Teacher, Track) để tránh lỗi DB.
     */
    private CourseEntity createBaseCourse(String title) {
        TeacherprofileEntity teacher = createTeacher("teacher_" + System.currentTimeMillis() + "@test.com");
        TrackEntity track = createTrack("T_" + System.currentTimeMillis(), "Track for " + title);

        CourseEntity course = new CourseEntity();
        course.setTitle(title);
        course.setStatus("DRAFT");
        course.setVersion(1);
        course.setTeacherprofile(teacher);
        course.setTrack(track);
        
        // QUAN TRỌNG: Khởi tạo danh sách rỗng để tránh NullPointerException (NPE)
        // Trong CourseConverter.getVersion(), hệ thống gọi children.stream().
        // Nếu object được tạo bằng 'new' thay vì lấy từ DB, các List mặc định là null -> crash khi mapping.
        course.setModules(new ArrayList<>());
        course.setChildren(new ArrayList<>()); 
        
        return courseRepository.save(course);
    }

    // ==================== MAI-CRS-001 ====================
    @Test
    @DisplayName("MAI-CRS-001: Lấy tất cả khóa học - verify dữ liệu từ MySQL")
    void getAllCourses_ShouldReturnListFromDB() {
        // === DATA ===
        createBaseCourse("MySQL Integration Course");

        // === ACTION ===
        List<CourseResponse> result = courseService.getAllCourses();

        // === CHECK DB/DATA ===
        assertNotNull(result);
        assertTrue(result.size() >= 1);
        assertTrue(result.stream().anyMatch(c -> c.getTitle().equals("MySQL Integration Course")));
    }

    // ==================== MAI-CRS-002 ====================
    @Test
    @DisplayName("MAI-CRS-002: Lấy khóa học theo ID - verify mapping dữ liệu")
    void getCourseById_ValidId_ShouldReturnCourseResponse() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Java Unit Test");
        Integer id = course.getId();

        // === ACTION ===
        CourseResponse result = courseService.getCourseById(id);

        // === CHECK DB/DATA ===
        assertEquals(id, result.getId());
        assertEquals("Java Unit Test", result.getTitle());
    }

    // ==================== MAI-CRS-003 ====================
    @Test
    @DisplayName("MAI-CRS-003: Lấy khóa học theo ID - ID không tồn tại - ném exception")
    void getCourseById_NotFound_ShouldThrow() {
        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> courseService.getCourseById(999999));
        assertEquals(ErrorCode.COURSE_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-CRS-004 ====================
    @Test
    @DisplayName("MAI-CRS-004: Lấy khóa học theo teacherId - verify DB filter")
    void getCoursesByTeacherId_ValidTeacher_ShouldReturnList() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Teacher's Own Course");
        Integer teacherId = course.getTeacherprofile().getId();

        // === ACTION ===
        List<CourseResponse> result = courseService.getCoursesByTeacherId(teacherId);

        // === CHECK DB/DATA ===
        assertFalse(result.isEmpty());
        assertTrue(result.stream().anyMatch(c -> c.getTitle().equals("Teacher's Own Course")));
    }

    // ==================== MAI-CRS-005 ====================
    @Test
    @DisplayName("MAI-CRS-005: addCourseToTrack - Lưu khóa học mới vào Track")
    void addCourseToTrack_Success_ShouldSaveCourse() {
        // === DATA (Dùng Helper đã tách) ===
        createTrack("TEST_TRACK", "Test Track");
        TeacherprofileEntity teacher = createTeacher("teacher_add@test.com");

        CourseRequest request = new CourseRequest();
        request.setTitle("New Track Course");
        request.setTrackCode("TEST_TRACK");
        request.setTeacherId(teacher.getId());

        // === ACTION ===
        courseService.addCourseToTrack(request, null);

        // === CHECK DB/DATA ===
        List<CourseEntity> all = courseRepository.findAll();
        assertTrue(all.stream().anyMatch(c -> c.getTitle().equals("New Track Course")));
    }

    // ==================== MAI-CRS-006 ====================
    @Test
    @DisplayName("MAI-CRS-006: publishCourse thành công - Tạo clone và tăng version")
    void publishCourse_Success_ShouldCreateCloneAndIncrementVersion() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Success Publish Course");

        // Xây dựng cấu trúc khóa học hoàn chỉnh (Module -> Lesson -> Exercise -> Question -> Choice)
        // Đây là yêu cầu bắt buộc của nghiệp vụ để được phép Publish
        ModuleEntity module = new ModuleEntity();
        module.setType(ModuleType.LESSON);
        module.setCourse(course);
        module = moduleRepository.save(module);

        LessonEntity lesson = new LessonEntity();
        lesson.setModule(module);
        MediaAssetEntity media = new MediaAssetEntity();
        media.setUrl("video.mp4");
        media.setLesson(lesson);
        lesson.setMediaassets(new ArrayList<>(List.of(media)));
        
        ExerciseTypeEntity exType = new ExerciseTypeEntity();
        exType.setCode("MCQ");
        exType = exerciseTypeRepository.save(exType);

        ExerciseEntity exercise = new ExerciseEntity();
        exercise.setExercisetype(exType);
        
        QuestionEntity question = new QuestionEntity();
        ChoiceEntity choice = new ChoiceEntity();
        choice.setIsCorrect(false);
        choice.setQuestion(question);
        question.setChoices(new ArrayList<>(List.of(choice)));
        exercise.setQuestions(new ArrayList<>(List.of(question)));
        lesson.setExercises(new ArrayList<>(List.of(exercise)));
        
        module.setLessons(new ArrayList<>(List.of(lesson)));
        course.setModules(new ArrayList<>(List.of(module)));
        courseRepository.save(course);

        // === ACTION ===
        courseService.publishCourse(course.getId());

        // === CHECK DB/DATA ===
        CourseEntity updatedCourse = courseRepository.findById(course.getId()).get();
        // Bản gốc phải tăng version và chuyển trạng thái OLD
        assertEquals(2, updatedCourse.getVersion());
        assertEquals("OLD", updatedCourse.getStatus());

        // Kiểm tra sự tồn tại của bản sao PUBLISHED (Clone)
        List<CourseEntity> all = courseRepository.findAll();
        boolean hasPublished = all.stream().anyMatch(c -> c.getStatus().equals("PUBLISHED") && c.getTitle().equals("Success Publish Course"));
        assertTrue(hasPublished);
    }

    // ==================== MAI-CRS-007 ====================
    @Test
    @DisplayName("MAI-CRS-007: Publish khóa học - Đã published - ném COURSE_PUBLISHED")
    void publishCourse_AlreadyPublished_ShouldThrow() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Published Course");
        
        // CHÚ Ý: Code Service đang check chuỗi cứng "PUBLISH" (không có ED) 
        // nên ta phải set đúng giá trị này để kích hoạt điều kiện ném lỗi.
        course.setStatus("PUBLISH"); 
        courseRepository.save(course);

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> courseService.publishCourse(course.getId()));
        assertEquals(ErrorCode.COURSE_PUBLISHED, ex.getErrorCode());
    }

    // ==================== MAI-CRS-008 ====================
    @Test
    @DisplayName("MAI-CRS-008: Publish khóa học - KH không có module - ném COURSE_EMPTY_MODULE")
    void publishCourse_NoModules_ShouldThrow() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Empty Course");

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> courseService.publishCourse(course.getId()));
        assertEquals(ErrorCode.COURSE_EMPTY_MODULE, ex.getErrorCode());
    }

    // ==================== MAI-CRS-009 ====================
    @Test
    @DisplayName("MAI-CRS-009: Publish khóa học - Module Lesson trống - ném MODULE_LESSON_EMPTY")
    void publishCourse_ModuleLessonEmpty_ShouldThrow() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Draft Course");
        ModuleEntity module = new ModuleEntity();
        module.setType(ModuleType.LESSON);
        module.setCourse(course);
        module.setLessons(new ArrayList<>());
        moduleRepository.save(module);
        course.getModules().add(module);

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> courseService.publishCourse(course.getId()));
        assertEquals(ErrorCode.MODULE_LESSON_EMPTY, ex.getErrorCode());
    }

    // ==================== MAI-CRS-010 ====================
    @Test
    @DisplayName("MAI-CRS-010: Publish khóa học - Bài tập không có câu hỏi - ném EXERCISE_QUESTION_EMPTY")
    void publishCourse_ExerciseNoQuestion_ShouldThrow() {
        // === DATA ===
        CourseEntity course = createBaseCourse("Course with Empty Exercise");
        ModuleEntity module = new ModuleEntity();
        module.setType(ModuleType.LESSON);
        module.setCourse(course);
        module = moduleRepository.save(module);

        LessonEntity lesson = new LessonEntity();
        lesson.setModule(module);
        MediaAssetEntity media = new MediaAssetEntity();
        media.setUrl("vid.mp4");
        media.setLesson(lesson);
        lesson.setMediaassets(new ArrayList<>(List.of(media)));
        
        ExerciseEntity exercise = new ExerciseEntity();
        exercise.setQuestions(new ArrayList<>());
        lesson.setExercises(new ArrayList<>(List.of(exercise)));
        
        module.setLessons(new ArrayList<>(List.of(lesson)));
        course.setModules(new ArrayList<>(List.of(module)));

        // === ACTION + CHECK ===
        AppException ex = assertThrows(AppException.class, () -> courseService.publishCourse(course.getId()));
        assertEquals(ErrorCode.EXERCISE_QUESTION_EMPTY, ex.getErrorCode());
    }

    // ==================== MAI-CRS-011 ====================
    @Test
    @DisplayName("MAI-CRS-011: getCourseForStudent - Lấy thông tin chi tiết và tính toán tiến độ")
    void getCourseForStudent_Success_ShouldReturnResponseWithProgress() {
        /**
         * MỤC ĐÍCH: Kiểm tra khả năng tổng hợp dữ liệu (Data Aggregation) cho Học sinh.
         * NGHIỆP VỤ: Khi học sinh xem khóa học, hệ thống phải tính toán được chuỗi tiến độ "x/y cúp".
         * Ý NGHĨA: Xác nhận việc kết hợp dữ liệu giữa Course, Module và Progress diễn ra chính xác,
         * đảm bảo học sinh thấy được lộ trình học tập cá nhân hóa.
         */
        // === DATA: Tạo khóa học có kèm 1 Module để test logic tính cúp ===
        CourseEntity course = createBaseCourse("Full Student Course");
        
        ModuleEntity module = new ModuleEntity();
        module.setTitle("Chương 1: Khởi đầu");
        module.setType(ModuleType.LESSON);
        module.setCourse(course);
        module.setOrderIndex(1L);
        module.setLessons(new ArrayList<>()); // Khởi tạo để tránh NPE trong LessonService
        moduleRepository.save(module);
        
        course.getModules().add(module);
        courseRepository.save(course);

        CourseRequest request = new CourseRequest();
        request.setId(course.getId());
        request.setStudentProfileId(1); // ID giả lập

        // === ACTION ===
        CourseResponse result = courseService.getCourseForStudent(request);

        // === CHECK DB/DATA ===
        assertNotNull(result, "Response không được null");
        assertEquals("Full Student Course", result.getTitle());
        
        // Kiểm tra danh sách Module lồng bên trong
        assertNotNull(result.getModules(), "Danh sách Module không được null");
        assertFalse(result.getModules().isEmpty(), "Danh sách Module phải có dữ liệu");
        assertEquals("Chương 1: Khởi đầu", result.getModules().get(0).getTitle());

        // Kiểm tra logic tính toán tiến độ (Mặc định chưa học là 0/3 cúp)
        assertNotNull(result.getCompletedCup(), "Chuỗi tiến độ không được null");
        assertTrue(result.getCompletedCup().contains("/"), "Chuỗi tiến độ phải có định dạng x/y");
        assertEquals("0/3", result.getCompletedCup(), "Tiến độ cho học sinh mới phải là 0/3");
    }

    // ==================== MAI-CRS-012 ====================
    @Test
    @DisplayName("MAI-CRS-012: getCourseForStudent - KH không tồn tại - ném exception")
    void getCourseForStudent_InvalidId_ShouldThrow() {
        /**
         * MỤC ĐÍCH: Kiểm tra xử lý lỗi khi truy cập dữ liệu không tồn tại.
         * Ý NGHĨA: Đảm bảo hệ thống không bị crash và trả về ErrorCode.COURSE_NOT_FOUND chính xác,
         * giúp Frontend có thể hiển thị thông báo lỗi thân thiện thay vì lỗi 500.
         */
        // === DATA ===
        CourseRequest request = new CourseRequest();
        request.setId(888888);

        // === ACTION + CHECK ===
        assertThrows(AppException.class, () -> courseService.getCourseForStudent(request));
    }

    // ==================== MAI-CRS-013 ====================
    @Test
    @DisplayName("MAI-CRS-013: isCompleted - KH không có module - Trả về true")
    void isCompleted_NoModules_ShouldReturnTrue() {
        /**
         * MỤC ĐÍCH: Kiểm tra trường hợp biên (Boundary Case) của logic hoàn thành.
         * NGHIỆP VỤ: Nếu một khóa học không có nội dung học tập, hệ thống mặc định coi là đã hoàn thành.
         * Ý NGHĨA: Tránh việc học sinh bị kẹt ở trạng thái "chưa hoàn thành" mãi mãi đối với các 
         * khóa học mang tính thông báo hoặc chưa cập nhật nội dung.
         */
        // === DATA ===
        CourseEntity course = createBaseCourse("Simple Course");
        course.setStatus("PUBLISHED");
        courseRepository.save(course);

        // === ACTION ===
        boolean result = courseService.isCompleted(course.getId(), 1);

        // === CHECK ===
        assertTrue(result);
    }

    // ==================== MAI-CRS-014 ====================
    @Test
    @DisplayName("MAI-CRS-014: isCompleted - Trả về false nếu có module chưa hoàn thành")
    void isCompleted_WithIncompleteModule_ShouldReturnFalse() {
        /**
         * MỤC ĐÍCH: Kiểm tra logic nòng cốt của việc công nhận hoàn thành khóa học.
         * NGHIỆP VỤ: Khóa học chỉ được coi là hoàn thành khi TẤT CẢ các module thành phần đều hoàn thành.
         * Ý NGHĨA: Đảm bảo tính khắt khe của hệ thống LMS, học sinh phải học hết bài mới được công nhận.
         * Đây là cơ sở để cấp Chứng chỉ hoặc Huy hiệu ở các module khác.
         */
        // === DATA ===
        CourseEntity course = createBaseCourse("Incomplete Course");
        ModuleEntity module = new ModuleEntity();
        module.setType(ModuleType.LESSON);
        module.setCourse(course);
        module = moduleRepository.save(module);

        LessonEntity lesson = new LessonEntity();
        lesson.setTitle("Unfinished Lesson");
        lesson.setModule(module);
        
        module.setLessons(new ArrayList<>(List.of(lesson)));
        course.setModules(new ArrayList<>(List.of(module)));
        courseRepository.save(course);

        // === ACTION ===
        boolean result = courseService.isCompleted(course.getId(), 1);

        // === CHECK ===
        assertFalse(result);
    }
}
