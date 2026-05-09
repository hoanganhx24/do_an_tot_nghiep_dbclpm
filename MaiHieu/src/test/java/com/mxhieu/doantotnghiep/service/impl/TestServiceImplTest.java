package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.TestConverter;
import com.mxhieu.doantotnghiep.dto.request.TestRequest;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class TestServiceImplTest {

    @Autowired
    private TestServiceImpl service;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    @Autowired
    private EnrollmentCourseRepository enrollmentcourseRepository;

    @Autowired
    private TestProgressRepository testProgressRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private TestConverter testConverter;

    @Test
    void createTest_shouldThrowWhenModuleNotFound() {
        // Test Case ID: MAI-TES-001
        int missingModuleId = -9999;
        TestRequest request = TestRequest.builder().moduleId(missingModuleId).build();
        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(TestEntity.builder().build());

        AppException ex = assertThrows(AppException.class, () -> service.createTest(request));

        assertEquals(ErrorCode.MODULE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createTest_shouldSetModuleAndSave() {
        // Test Case ID: MAI-TES-002
        String testName = uniqueName("MiniTest");
        ModuleEntity module = createModuleWithCourse();

        TestRequest request = TestRequest.builder().moduleId(module.getId()).name(testName).build();
        TestEntity entity = TestEntity.builder().name(testName).build();
        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity);

        service.createTest(request);

        TestEntity saved = testRepository.findAll().stream()
                .filter(test -> testName.equals(test.getName()))
                .findFirst()
                .orElseThrow();

        assertEquals(module.getId(), saved.getModule().getId());
    }

    @Test
    void getTestById_shouldThrowWhenNotFound() {
        // Test Case ID: MAI-TES-003
        int missingId = -9999;

        AppException ex = assertThrows(AppException.class, () -> service.getTestById(missingId));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestById_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-TES-004
        ModuleEntity module = createModuleWithCourse();
        TestEntity entity = createTestEntity(uniqueName("TestById"), "TYPE", module);
        TestResponse expected = TestResponse.builder().id(entity.getId()).name("A").build();

        when(testConverter.toResponse(entity, TestResponse.class)).thenReturn(expected);

        TestResponse actual = service.getTestById(entity.getId());

        assertEquals(entity.getId(), actual.getId());
        assertEquals("A", actual.getName());
    }

    @Test
    void createFirstTest_shouldSaveMappedEntity() {
        // Test Case ID: MAI-TES-005
        String testName = uniqueName("FirstTest");
        TestRequest request = TestRequest.builder().name(testName).build();
        TestEntity entity = TestEntity.builder().name(testName).build();
        when(testConverter.toEntity(request, TestEntity.class)).thenReturn(entity);

        service.createFirstTest(request);

        TestEntity saved = testRepository.findAll().stream()
                .filter(test -> testName.equals(test.getName()))
                .findFirst()
                .orElseThrow();

        assertEquals(testName, saved.getName());
    }

    @Test
    void getFirstTestsSummery_shouldConvertEveryEntity() {
        // Test Case ID: MAI-TES-006
        ModuleEntity module = createModuleWithCourse();
        TestEntity e1 = createTestEntity(uniqueName("FirstTest1"), "FIRST_TEST", module);
        TestEntity e2 = createTestEntity(uniqueName("FirstTest2"), "FIRST_TEST", module);

        when(testConverter.toResponseSummery(e1)).thenReturn(TestResponse.builder().id(e1.getId()).build());
        when(testConverter.toResponseSummery(e2)).thenReturn(TestResponse.builder().id(e2.getId()).build());

        List<TestResponse> result = service.getFirstTestsSummery();

        assertTrue(result.size() >= 2);
        assertTrue(result.stream().anyMatch(response -> response != null && e1.getId().equals(response.getId())));
        assertTrue(result.stream().anyMatch(response -> response != null && e2.getId().equals(response.getId())));
    }

    @Test
    void commpletedStar_shouldReturnZeroWhenNoAttempt() {
        // Test Case ID: MAI-TES-007
        int testId = -9999;
        int studentProfileId = -9999;

        int star = service.commpletedStar(testId, studentProfileId);

        assertEquals(0, star);
    }

    @Test
    void commpletedStar_shouldReturnThreeForPerfectScore() {
        // Test Case ID: MAI-TES-008
        ModuleEntity module = createModuleWithCourse();
        TestEntity test = createTestEntity(uniqueName("PerfectScore"), "TYPE", module);
        StudentProfileEntity student = createStudentProfile("student-perfect-" + UUID.randomUUID() + "@example.com");
        createTestAttempt(test, student, 100f);

        int star = service.commpletedStar(test.getId(), student.getId());

        assertEquals(3, star);
    }

    @Test
    void commpletedStar_shouldReturnTwoForScoreFromSeventy() {
        // Test Case ID: MAI-TES-009
        ModuleEntity module = createModuleWithCourse();
        TestEntity test = createTestEntity(uniqueName("SeventyScore"), "TYPE", module);
        StudentProfileEntity student = createStudentProfile("student-seventy-" + UUID.randomUUID() + "@example.com");
        createTestAttempt(test, student, 75f);

        int star = service.commpletedStar(test.getId(), student.getId());

        assertEquals(2, star);
    }

    @Test
    void commpletedStar_shouldReturnOneForPositiveLowScore() {
        // Test Case ID: MAI-TES-010
        ModuleEntity module = createModuleWithCourse();
        TestEntity test = createTestEntity(uniqueName("LowScore"), "TYPE", module);
        StudentProfileEntity student = createStudentProfile("student-low-" + UUID.randomUUID() + "@example.com");
        createTestAttempt(test, student, 40f);

        int star = service.commpletedStar(test.getId(), student.getId());

        assertEquals(1, star);
    }

    @Test
    void getTestAttemptIds_shouldReturnEmptyWhenNoAttemptExists() {
        // Test Case ID: MAI-TES-011
        int testId = -9999;
        int studentProfileId = -9999;

        List<Integer> ids = service.getTestAttemptIds(testId, studentProfileId);

        assertEquals(0, ids.size());
    }

    @Test
    void getTestAttemptIds_shouldReturnAllAttemptIds() {
        // Test Case ID: MAI-TES-012
        ModuleEntity module = createModuleWithCourse();
        TestEntity test = createTestEntity(uniqueName("AttemptIds"), "TYPE", module);
        StudentProfileEntity student = createStudentProfile("student-ids-" + UUID.randomUUID() + "@example.com");
        TestAttemptEntity a1 = createTestAttempt(test, student, 10f);
        TestAttemptEntity a2 = createTestAttempt(test, student, 20f);

        List<Integer> ids = service.getTestAttemptIds(test.getId(), student.getId());

        assertEquals(List.of(a1.getId(), a2.getId()), ids);
    }

    @Test
    void isLock_shouldReturnTrueWhenCourseStatusIsLock() {
        // Test Case ID: MAI-TES-013
        StudentProfileEntity student = createStudentProfile("student-lock-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("LockCourse"));
        EnrollmentEntity enrollment = createEnrollment(student, pair.track, 1);
        createEnrollmentCourse(enrollment, pair.course, "LOCK");

        assertTrue(service.isLock(pair.test.getId(), student.getId()));
    }

    @Test
    void isLock_shouldReturnFalseWhenCourseStatusDone() {
        // Test Case ID: MAI-TES-014
        StudentProfileEntity student = createStudentProfile("student-done-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("DoneCourse"));
        EnrollmentEntity enrollment = createEnrollment(student, pair.track, 1);
        createEnrollmentCourse(enrollment, pair.course, "DONE");

        assertFalse(service.isLock(pair.test.getId(), student.getId()));
    }

    @Test
    void isLock_shouldReturnTrueWhenCourseUnlockedButNoProgress() {
        // Test Case ID: MAI-TES-015
        StudentProfileEntity student = createStudentProfile("student-unlock-noprogress-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("UnlockCourse"));
        EnrollmentEntity enrollment = createEnrollment(student, pair.track, 1);
        createEnrollmentCourse(enrollment, pair.course, "UNLOCK");

        assertTrue(service.isLock(pair.test.getId(), student.getId()));
    }

    @Test
    void isLock_shouldReturnFalseWhenCourseUnlockedAndHasProgress() {
        // Test Case ID: MAI-TES-016
        StudentProfileEntity student = createStudentProfile("student-unlock-progress-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("UnlockProgress"));
        EnrollmentEntity enrollment = createEnrollment(student, pair.track, 1);
        createEnrollmentCourse(enrollment, pair.course, "UNLOCK");
        createTestProgress(pair.test, student, 0);

        assertFalse(service.isLock(pair.test.getId(), student.getId()));
    }

    @Test
    void isCompletedTest_shouldReturnFalseWhenNoProgressRecord() {
        // Test Case ID: MAI-TES-017
        int testId = -9999;
        int studentProfileId = -9999;

        assertFalse(service.isCompletedTest(testId, studentProfileId));
    }

    @Test
    void isCompletedTest_shouldReturnFalseWhenProcessIsOne() {
        // Test Case ID: MAI-TES-018
        StudentProfileEntity student = createStudentProfile("student-progress-1-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("ProgressOne"));
        createTestProgress(pair.test, student, 1);

        assertFalse(service.isCompletedTest(pair.test.getId(), student.getId()));
    }

    @Test
    void isCompletedTest_shouldReturnTrueWhenProcessIsTwo() {
        // Test Case ID: MAI-TES-019
        StudentProfileEntity student = createStudentProfile("student-progress-2-" + UUID.randomUUID() + "@example.com");
        CourseModulePair pair = createCourseWithModuleAndTest(uniqueName("ProgressTwo"));
        createTestProgress(pair.test, student, 2);

        assertTrue(service.isCompletedTest(pair.test.getId(), student.getId()));
    }

    @Test
    void deleteTest_shouldDeleteSavedTest() {
        // Test Case ID: MAI-TES-020
        ModuleEntity module = createModuleWithCourse();
        TestEntity test = createTestEntity(uniqueName("DeleteTest"), "TYPE", module);

        service.deleteTest(test.getId());

        assertFalse(testRepository.existsById(test.getId()));
    }

    private ModuleEntity createModuleWithCourse() {
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email("teacher-" + uniqueName("t") + "@example.com")
                .password("password")
                .fullName("Teacher")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TrackEntity track = trackRepository.save(TrackEntity.builder()
                .code("TRACK-" + UUID.randomUUID())
                .build());

        CourseEntity course = courseRepository.save(CourseEntity.builder()
                .title("Course " + uniqueName("c"))
                .type("COURSE")
                .status("ACTIVE")
                .levelTag(1)
                .isPublished(1)
                .version(1)
                .teacherprofile(teacher)
                .track(track)
                .build());

        return moduleRepository.save(ModuleEntity.builder()
                .course(course)
                .orderIndex(1L)
                .type(ModuleType.TEST)
                .build());
    }

    private TestEntity createTestEntity(String name, String type, ModuleEntity module) {
        return testRepository.save(TestEntity.builder()
                .name(name)
                .type(type)
                .module(module)
                .build());
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

    private TestAttemptEntity createTestAttempt(TestEntity test, StudentProfileEntity student, float score) {
        return testAttemptRepository.save(TestAttemptEntity.builder()
                .test(test)
                .studentProfile(student)
                .totalScore(score)
                .testAt(LocalDateTime.now())
                .build());
    }

    private TestProgressEntity createTestProgress(TestEntity test, StudentProfileEntity student, int process) {
        return testProgressRepository.save(TestProgressEntity.builder()
                .test(test)
                .studentProfile(student)
                .process(process)
                .build());
    }

    private EnrollmentEntity createEnrollment(StudentProfileEntity student, TrackEntity track, int status) {
        return enrollmentRepository.save(EnrollmentEntity.builder()
                .studentProfile(student)
                .track(track)
                .status(status)
                .build());
    }

    private EnrollmentCourseEntity createEnrollmentCourse(EnrollmentEntity enrollment, CourseEntity course, String status) {
        return enrollmentcourseRepository.save(EnrollmentCourseEntity.builder()
                .enrollment(enrollment)
                .course(course)
                .status(status)
                .build());
    }

    private String uniqueName(String prefix) {
        return prefix + "-" + Math.abs(UUID.randomUUID().hashCode() % 10000);
    }

    private CourseModulePair createCourseWithModuleAndTest(String courseTitle) {
        UserEntity teacherUser = userRepository.save(UserEntity.builder()
                .email("teacher-course-" + uniqueName("tc") + "@example.com")
                .password("password")
                .fullName("Teacher Course")
                .build());

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TrackEntity track = trackRepository.save(TrackEntity.builder()
                .code("TRACK-" + UUID.randomUUID())
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
                .type(ModuleType.TEST)
                .build());

        TestEntity test = testRepository.save(TestEntity.builder()
                .name(uniqueName("t"))
                .type("TYPE")
                .module(module)
                .build());

        return new CourseModulePair(track, course, module, test);
    }

    private static class CourseModulePair {
        final TrackEntity track;
        final CourseEntity course;
        final ModuleEntity module;
        final TestEntity test;

        CourseModulePair(TrackEntity track, CourseEntity course, ModuleEntity module, TestEntity test) {
            this.track = track;
            this.course = course;
            this.module = module;
            this.test = test;
        }
    }
}
