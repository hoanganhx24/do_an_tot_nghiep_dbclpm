package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.TestProgressRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.LessonProgressService;
import com.mxhieu.doantotnghiep.service.LessonService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class TestProgressServiceImplTest {

    @Autowired
    private TestProgressServiceImpl service;

    @Autowired
    private TestProgressRepository testProgressRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @MockBean
    private LessonService lessonService;

    @MockBean
    private LessonProgressService lessonProgressService;

    @Test
    void checkCompletionCondition_shouldThrowWhenTestNotFound() {
        // Test Case ID: MAI-TPR-001
        int missingTestId = -9999;
        TestProgressRequest request = TestProgressRequest.builder().testId(missingTestId).studentprofileId(2).build();

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TPR-002
        TestEntity test = createTestWithCourse("StudentMissingTest");
        int missingStudentId = -9999;
        TestProgressRequest request = TestProgressRequest.builder().testId(test.getId()).studentprofileId(missingStudentId).build();

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenProgressRecordMissing() {
        // Test Case ID: MAI-TPR-003
        TestEntity test = createTestWithCourse("ProgressMissingTest");
        StudentProfileEntity student = createStudentProfile("progress-missing@example.com");
        TestProgressRequest request = TestProgressRequest.builder().testId(test.getId()).studentprofileId(student.getId()).build();

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.TEST_PROGRESS_NOT_EXISTS, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldReturnFalseWhenMaxAttemptBelowThreshold() {
        // Test Case ID: MAI-TPR-004
        TestEntity test = createTestWithCourse("BelowThresholdTest");
        StudentProfileEntity student = createStudentProfile("below-threshold@example.com");
        TestProgressEntity progress = createTestProgress(test, student, 0);
        createTestAttempt(test, student, 49f);

        TestProgressRequest request = TestProgressRequest.builder().testId(test.getId()).studentprofileId(student.getId()).build();

        boolean result = service.checkCompletionCondition(request);

        assertFalse(result);
        TestProgressEntity updated = testProgressRepository.findById(progress.getId()).orElseThrow();
        assertEquals(1, updated.getProcess());
    }

    @Test
    void checkCompletionCondition_shouldReturnTrueAndUseFallbackUnlockWhenNoNextItem() {
        // Test Case ID: MAI-TPR-005
        CourseModulePair pair = createCourseModuleAndTest("FallbackUnlockCourse");
        StudentProfileEntity student = createStudentProfile("fallback-unlock@example.com");
        TestProgressEntity progress = createTestProgress(pair.test, student, 0);
        createTestAttempt(pair.test, student, 80f);
        TestProgressRequest request = TestProgressRequest.builder().testId(pair.test.getId()).studentprofileId(student.getId()).build();

        when(lessonService.getNextLessonOrTest(any(LessonOrTestAroundRequest.class)))
                .thenThrow(new AppException(ErrorCode.LESSON_NOT_HAS_NEXT));

        boolean result = service.checkCompletionCondition(request);

        assertTrue(result);
        TestProgressEntity updated = testProgressRepository.findById(progress.getId()).orElseThrow();
        assertEquals(2, updated.getProcess());
        verify(lessonProgressService).unLockNextCourse(pair.course, student);
    }

    private StudentProfileEntity createStudentProfile(String email) {
        UserEntity user = userRepository.save(UserEntity.builder()
                .email(email)
                .password("password")
                .fullName("Student")
                .build());

        return studentProfileRepository.save(StudentProfileEntity.builder()
                .firstLogin(false)
                .user(user)
                .build());
    }

    private TestEntity createTestWithCourse(String testName) {
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email(testName + "-teacher@example.com")
                .password("password")
                .fullName("Teacher")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TrackEntity track = trackRepository.save(TrackEntity.builder()
                .code("TRACK-" + System.nanoTime())
                .build());

        CourseEntity course = courseRepository.save(CourseEntity.builder()
                .title(testName)
                .type("COURSE")
                .status("ACTIVE")
                .levelTag(1)
                .isPublished(1)
                .version(1)
                .teacherprofile(teacher)
                .track(track)
                .build());

        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .orderIndex(1L)
                .type(null)
                .build());

        return testRepository.save(TestEntity.builder()
                .name(testName)
                .type("TYPE")
                .module(module)
                .build());
    }

    private TestProgressEntity createTestProgress(TestEntity test, StudentProfileEntity student, int process) {
        return testProgressRepository.save(TestProgressEntity.builder()
                .test(test)
                .studentProfile(student)
                .process(process)
                .build());
    }

    private TestAttemptEntity createTestAttempt(TestEntity test, StudentProfileEntity student, float score) {
        return testAttemptRepository.save(TestAttemptEntity.builder()
                .test(test)
                .studentProfile(student)
                .totalScore(score)
                .testAt(java.time.LocalDateTime.now())
                .build());
    }

    private CourseModulePair createCourseModuleAndTest(String courseTitle) {
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email(courseTitle + "-teacher@example.com")
                .password("password")
                .fullName("Teacher")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TrackEntity track = trackRepository.save(TrackEntity.builder()
                .code("TRACK-" + System.nanoTime())
                .build());

        CourseEntity course = courseRepository.save(CourseEntity.builder()
                .title(courseTitle)
                .type("COURSE")
                .status("ACTIVE")
                .levelTag(1)
                .isPublished(1)
                .version(1)
                .teacherprofile(teacher)
                .track(track)
                .build());

        ModuleEntity module = moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .orderIndex(1L)
                .type(null)
                .build());

        TestEntity test = testRepository.save(TestEntity.builder()
                .name(courseTitle + "-Test")
                .type("TYPE")
                .module(module)
                .build());

        return new CourseModulePair(course, module, test);
    }

    private static class CourseModulePair {
        final CourseEntity course;
        final ModuleEntity module;
        final TestEntity test;

        CourseModulePair(CourseEntity course, ModuleEntity module, TestEntity test) {
            this.course = course;
            this.module = module;
            this.test = test;
        }
    }
}
