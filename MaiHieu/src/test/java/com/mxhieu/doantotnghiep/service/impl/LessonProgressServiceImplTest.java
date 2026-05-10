package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
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
 * Integration Test cho LessonProgressServiceImpl sử dụng MySQL.
 *
 * Nghiệp vụ (Docs đồ án & UC 2.3.17, 2.3.18):
 * - Theo dõi tiến độ học tập: Cập nhật % xem video bài giảng.
 * - Điều kiện hoàn thành: (1) Xem video đạt ngưỡng % (GatingRules) AND (2) Hoàn thành tất cả bài tập trong bài.
 * - Cơ chế mở khóa (Gating): Khi hoàn thành bài học, hệ thống tự động mở khóa bài học/bài kiểm tra tiếp theo
 *   hoặc mở khóa Khóa học/Track tiếp theo nếu đã đạt đến cuối danh sách.
 *
 * Đối chiếu System Test:
 * - HKH_FU_11 (PASS): Cập nhật % xem video.
 * - HKH_FU_12 (PASS): Đánh dấu hoàn thành khi thỏa mãn cả 2 điều kiện.
 * - HKH_FU_5 (FAIL trong thực tế): Bắt buộc xem video dù đã làm xong test -> Test này sẽ verify logic "cứng nhắc" này.
 * - HKH_UI_18 (FAIL trong thực tế): Lỗi không mở khóa bài tiếp theo -> Kiểm tra logic unLockNextLesson.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LessonProgressServiceImplTest {

    @Autowired
    private LessonProgressServiceImpl lessonProgressService;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private EnrollmentCourseRepository enrollmentCourseRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    /**
     * Helper setup chuỗi dữ liệu Lesson.
     */
    private LessonEntity setupFullLessonChain(String trackCode, String lessonTitle, Integer gating) {
        TrackEntity track = trackRepository.findByCode(trackCode).orElseGet(() -> 
            trackRepository.save(TrackEntity.builder().code(trackCode).name("Progress Track").build())
        );

        UserEntity userTea = new UserEntity();
        userTea.setEmail("tea_lp_" + System.currentTimeMillis() + "@test.com");
        userTea = userRepository.save(userTea);
        
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(userTea);
        teacher = teacheprofileRepository.save(teacher);

        CourseEntity course = new CourseEntity();
        course.setTitle("Progress Course");
        course.setTrack(track);
        course.setTeacherprofile(teacher);
        course.setModules(new ArrayList<>());
        course = courseRepository.save(course);

        ModuleEntity module = new ModuleEntity();
        module.setCourse(course);
        module.setType(ModuleType.LESSON);
        module.setOrderIndex(1L);
        module.setLessons(new ArrayList<>());
        module = moduleRepository.save(module);
        course.getModules().add(module);

        LessonEntity lesson = new LessonEntity();
        lesson.setModule(module);
        lesson.setTitle(lessonTitle);
        lesson.setGatingRules(gating);
        lesson.setOrderIndex(1);
        lesson.setExercises(new ArrayList<>());
        lesson = lessonRepository.save(lesson);
        module.getLessons().add(lesson);
        return lesson;
    }

    private StudentProfileEntity createStudent() {
        UserEntity user = new UserEntity();
        user.setEmail("std_lp_" + System.currentTimeMillis() + "@test.com");
        user = userRepository.save(user);
        StudentProfileEntity student = new StudentProfileEntity();
        student.setUser(user);
        return studentProfileRepository.save(student);
    }

    // ==================== MAI-LPS-001 (PASS) ====================
    @Test
    @DisplayName("MAI-LPS-001: Cập nhật % xem video - Đúng kịch bản HKH_FU_11")
    void checkCompletionCondition_UpdatePercentage_ShouldSuccess() {
        LessonEntity lesson = setupFullLessonChain("TRK-1", "Lesson 1", 80);
        StudentProfileEntity student = createStudent();
        
        LessonProgressEntity progress = new LessonProgressEntity();
        progress.setLesson(lesson);
        progress.setStudentProfile(student);
        progress.setPercentageWatched(10);
        progress.setProcess(0);
        lessonProgressRepository.save(progress);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(lesson.getId());
        request.setStudentProfileId(student.getId());
        request.setPercentageWatched(50);

        lessonProgressService.checkCompletionCondition(request);

        LessonProgressEntity updated = lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(lesson.getId(), student.getId()).get(0);
        assertEquals(50, updated.getPercentageWatched());
        assertEquals(1, updated.getProcess(), "Học sinh đang học (status = 1)");
    }

    // ==================== MAI-LPS-002 (PASS) ====================
    @Test
    @DisplayName("MAI-LPS-002: Hoàn thành bài học - Đúng kịch bản HKH_FU_12")
    void checkCompletionCondition_EnoughWatchedNoExercise_ShouldComplete() {
        LessonEntity lesson = setupFullLessonChain("TRK-2", "Lesson 2", 80);
        StudentProfileEntity student = createStudent();
        
        LessonProgressEntity progress = new LessonProgressEntity();
        progress.setLesson(lesson);
        progress.setStudentProfile(student);
        progress.setPercentageWatched(0);
        progress.setProcess(0);
        lessonProgressRepository.save(progress);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(lesson.getId());
        request.setStudentProfileId(student.getId());
        request.setPercentageWatched(85);

        Boolean result = lessonProgressService.checkCompletionCondition(request);

        assertTrue(result);
        LessonProgressEntity updated = lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(lesson.getId(), student.getId()).get(0);
        assertEquals(2, updated.getProcess(), "Phải đánh dấu DONE (status = 2)");
    }

    // ==================== MAI-LPS-003 (FAIL Scenario HKH_FU_5) ====================
    @Test
    @DisplayName("MAI-LPS-003: Chưa đủ % video dù bài tập đã xong -> Không hoàn thành (Logic HKH_FU_5)")
    void checkCompletionCondition_ExerciseDoneButVideoPending_ShouldStayLearning() {
        LessonEntity lesson = setupFullLessonChain("TRK-3", "Lesson 3", 100); // Gating 100%
        
        ExerciseTypeEntity type = exerciseTypeRepository.findByCode("MULTIPLE_CHOICE").orElseGet(() -> 
            exerciseTypeRepository.save(ExerciseTypeEntity.builder().code("MULTIPLE_CHOICE").description("Test").build())
        );
        ExerciseEntity exercise = new ExerciseEntity();
        exercise.setLesson(lesson);
        exercise.setExercisetype(type);
        exercise.setTitle("Quiz");
        exercise = exerciseRepository.save(exercise);
        lesson.getExercises().add(exercise);

        StudentProfileEntity student = createStudent();
        
        // Giả lập đã làm bài tập (Attempt)
        AttemptEntity attempt = new AttemptEntity();
        attempt.setStudentProfile(student);
        attempt.setExercise(exercise);
        attemptRepository.save(attempt);

        LessonProgressEntity progress = new LessonProgressEntity();
        progress.setLesson(lesson);
        progress.setStudentProfile(student);
        progress.setPercentageWatched(50); // Chỉ mới xem 50%
        progress.setProcess(1);
        lessonProgressRepository.save(progress);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(lesson.getId());
        request.setStudentProfileId(student.getId());
        request.setPercentageWatched(50);

        Boolean result = lessonProgressService.checkCompletionCondition(request);

        assertFalse(result, "HKH_FU_5 chỉ ra rằng hệ thống không cho hoàn thành nếu chưa xem đủ video");
        LessonProgressEntity updated = lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(lesson.getId(), student.getId()).get(0);
        assertNotEquals(2, updated.getProcess(), "Chưa thể DONE");
    }

    // ==================== MAI-LPS-004 (Unlocking Logic) ====================
    @Test
    @DisplayName("MAI-LPS-004: Mở khóa bài học tiếp theo - Verify HKH_FU_6")
    void checkCompletionCondition_Complete_ShouldUnlockNext() {
        LessonEntity lesson1 = setupFullLessonChain("TRK-6", "Lesson 1", 50);
        ModuleEntity module = lesson1.getModule();
        
        // Tạo bài học thứ 2 trong cùng module
        LessonEntity lesson2 = new LessonEntity();
        lesson2.setModule(module);
        lesson2.setTitle("Lesson 2");
        lesson2.setOrderIndex(2); // Tiếp theo bài 1
        lesson2.setExercises(new ArrayList<>());
        lesson2 = lessonRepository.save(lesson2);
        module.getLessons().add(lesson2);

        StudentProfileEntity student = createStudent();
        
        // Progress cho bài 1
        LessonProgressEntity p1 = new LessonProgressEntity();
        p1.setLesson(lesson1);
        p1.setStudentProfile(student);
        p1.setPercentageWatched(0);
        p1.setProcess(0);
        lessonProgressRepository.save(p1);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(lesson1.getId());
        request.setStudentProfileId(student.getId());
        request.setPercentageWatched(60); // Đạt 50%

        lessonProgressService.checkCompletionCondition(request);

        // CHECK: Bài 2 phải được tự động tạo LessonProgress với status 0 (Unlock)
        List<LessonProgressEntity> nextProgress = lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(lesson2.getId(), student.getId());
        assertFalse(nextProgress.isEmpty(), "Bài 2 phải được mở khóa");
        assertEquals(0, nextProgress.get(0).getProcess());
    }

    // ==================== MAI-LPS-005 (Exception Case) ====================
    @Test
    @DisplayName("MAI-LPS-005: Student không tồn tại -> Ném STUDENT_PROFILE_NOT_FOUND")
    void checkCompletionCondition_StudentNotFound_ShouldThrow() {
        LessonEntity lesson = setupFullLessonChain("TRK-7", "Lesson X", 80);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(lesson.getId());
        request.setStudentProfileId(999999);
        request.setPercentageWatched(50);

        AppException ex = assertThrows(AppException.class, () -> lessonProgressService.checkCompletionCondition(request));
        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    // ==================== MAI-LPS-006 (Cascading Unlock - Course) ====================
    @Test
    @DisplayName("MAI-LPS-006: Hoàn thành bài cuối module -> Mở khóa Course tiếp theo")
    void checkCompletionCondition_LastLesson_ShouldUnlockNextCourse() {
        TrackEntity track = trackRepository.save(TrackEntity.builder().code("TRK-NEXT").name("Track Next").build());
        
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        UserEntity userTea = userRepository.save(new UserEntity());
        teacher.setUser(userTea);
        teacher = teacheprofileRepository.save(teacher);

        // Course 1
        CourseEntity c1 = new CourseEntity();
        c1.setTitle("Course 1");
        c1.setTrack(track);
        c1.setTeacherprofile(teacher);
        c1.setModules(new ArrayList<>());
        c1 = courseRepository.save(c1);

        // Course 2
        CourseEntity c2 = new CourseEntity();
        c2.setTitle("Course 2");
        c2.setTrack(track);
        c2.setTeacherprofile(teacher);
        c2.setModules(new ArrayList<>());
        c2 = courseRepository.save(c2);

        // Enrollment cho Course 1 và 2
        EnrollmentEntity enrollment = EnrollmentEntity.builder()
                .studentProfile(createStudent())
                .track(track)
                .status(1)
                .build();
        enrollment = enrollmentRepository.save(enrollment);
        
        EnrollmentCourseEntity ec1 = new EnrollmentCourseEntity();
        ec1.setEnrollment(enrollment);
        ec1.setCourse(c1);
        ec1.setStatus("UNLOCK");
        ec1 = enrollmentCourseRepository.save(ec1);

        EnrollmentCourseEntity ec2 = new EnrollmentCourseEntity();
        ec2.setEnrollment(enrollment);
        ec2.setCourse(c2);
        ec2.setStatus("LOCK");
        ec2 = enrollmentCourseRepository.save(ec2);

        // Module + Lesson bài cuối của Course 1
        ModuleEntity m1 = new ModuleEntity();
        m1.setCourse(c1);
        m1.setType(ModuleType.LESSON);
        m1.setOrderIndex(1L);
        m1.setLessons(new ArrayList<>());
        m1 = moduleRepository.save(m1);
        c1.getModules().add(m1);

        LessonEntity l1 = new LessonEntity();
        l1.setModule(m1);
        l1.setTitle("Last Lesson");
        l1.setOrderIndex(1);
        l1.setGatingRules(50);
        l1.setExercises(new ArrayList<>());
        l1 = lessonRepository.save(l1);
        m1.getLessons().add(l1);

        // Action: Hoàn thành l1
        LessonProgressEntity progress = new LessonProgressEntity();
        progress.setLesson(l1);
        progress.setStudentProfile(enrollment.getStudentProfile());
        progress.setPercentageWatched(0);
        progress.setProcess(0);
        lessonProgressRepository.save(progress);

        LessonProgressRequest request = new LessonProgressRequest();
        request.setLessonId(l1.getId());
        request.setStudentProfileId(enrollment.getStudentProfile().getId());
        request.setPercentageWatched(100);

        lessonProgressService.checkCompletionCondition(request);

        // CHECK: Course 2 phải được UNLOCK
        EnrollmentCourseEntity updatedEc2 = enrollmentCourseRepository.findById(ec2.getId()).get();
        assertEquals("UNLOCK", updatedEc2.getStatus(), "Course 2 phải được mở khóa khi xong Course 1");
    }
}
