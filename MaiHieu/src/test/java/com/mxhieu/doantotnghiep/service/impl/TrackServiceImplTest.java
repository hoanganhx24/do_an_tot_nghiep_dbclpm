package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.TrackConverter;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.EnrollmentRepository;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.TrackRepository;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.CourseService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class TrackServiceImplTest {

    @Autowired
    private TrackServiceImpl trackService;

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacheprofileRepository teacheprofileRepository;

    @MockBean
    private TrackConverter trackConverter;

    @Test
    void findAll_shouldConvertEveryTrackEntity() {
        // Test Case ID: MAI-TRS-001
        String codeA = "TEST-TRACK-A-" + UUID.randomUUID();
        String codeB = "TEST-TRACK-B-" + UUID.randomUUID();
        TrackEntity trackA = TrackEntity.builder().code(codeA).build();
        TrackEntity trackB = TrackEntity.builder().code(codeB).build();
        trackRepository.save(trackA);
        trackRepository.save(trackB);

        when(trackConverter.toResponse(any(TrackEntity.class), eq(TrackResponse.class)))
                .thenAnswer(invocation -> TrackResponse.builder()
                        .code(invocation.getArgument(0, TrackEntity.class).getCode())
                        .build());

        List<TrackResponse> result = trackService.findAll("ALL");

        assertEquals(2, result.stream().filter(track -> codeA.equals(track.getCode()) || codeB.equals(track.getCode())).count());
        assertTrue(result.stream().anyMatch(track -> codeA.equals(track.getCode())));
        assertTrue(result.stream().anyMatch(track -> codeB.equals(track.getCode())));
    }

    @Test
    void getCoursesByTrackCode_shouldThrowWhenTrackNotFound() {
        // Test Case ID: MAI-TRS-002
        String trackCode = "TEST-NOT-FOUND-" + UUID.randomUUID();

        AppException ex = assertThrows(AppException.class, () -> trackService.getCoursesByTrackCode(trackCode, "ALL"));

        assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getCoursesByTrackCode_shouldReturnConvertedTrackResponse() {
        // Test Case ID: MAI-TRS-003
        String trackCode = "TEST-TRACK-" + UUID.randomUUID();
        TrackEntity track = TrackEntity.builder().code(trackCode).build();
        track = trackRepository.save(track);
        TrackResponse expected = TrackResponse.builder().code(trackCode).name("Starter").build();

        when(trackConverter.toTrackResponseWithCourses(track, "ALL")).thenReturn(expected);

        TrackResponse actual = trackService.getCoursesByTrackCode(trackCode, "ALL");

        assertEquals(trackCode, actual.getCode());
        assertEquals("Starter", actual.getName());
    }

    @Test
    void trackDauTienChuaHoanThanhVaMoKhoa_shouldThrowWhenStudentHasNoEnrollment() {
        // Test Case ID: MAI-TRS-004
        AppException ex = assertThrows(AppException.class, () -> trackService.trackDauTienChuaHoanThanhVaMoKhoa(777));

        assertEquals(ErrorCode.STUDENT_NOT_HAVE_ENROLLMENT, ex.getErrorCode());
    }

    @Test
    void trackDauTienChuaHoanThanhVaMoKhoa_shouldReturnUnlockedTrackId() {
        // Test Case ID: MAI-TRS-005
        UserEntity user = UserEntity.builder()
                .email("student-track@example.com")
                .password("password")
                .fullName("Student Track")
                .build();
        user = userRepository.save(user);

        StudentProfileEntity student = StudentProfileEntity.builder()
                .firstLogin(false)
                .user(user)
                .build();
        student = studentProfileRepository.save(student);

        TrackEntity track = TrackEntity.builder().code("TRACK-1").build();
        track = trackRepository.save(track);

        EnrollmentEntity done = EnrollmentEntity.builder()
                .status(2)
                .track(track)
                .studentProfile(student)
                .build();
        EnrollmentEntity unlocked = EnrollmentEntity.builder()
                .status(1)
                .track(track)
                .studentProfile(student)
                .build();
        enrollmentRepository.save(done);
        enrollmentRepository.save(unlocked);

        Integer actual = trackService.trackDauTienChuaHoanThanhVaMoKhoa(student.getId());

        assertEquals(track.getId(), actual);
    }

    @Test
    void getLastLessonOfTrack_shouldThrowWhenTrackNotFound() {
        // Test Case ID: MAI-TRS-006
        int missingTrackId = 88;
        if (trackRepository.findById(missingTrackId).isPresent()) {
            trackRepository.deleteById(missingTrackId);
        }

        AppException ex = assertThrows(AppException.class, () -> trackService.getLastLessonOfTrack(missingTrackId));

        assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getLastLessonOfTrack_shouldReturnLastLessonWhenLastModuleIsLessonType() {
        // Test Case ID: MAI-TRS-007
        UserEntity teacherUser = UserEntity.builder()
                .email("teacher-lesson@example.com")
                .password("password")
                .fullName("Teacher Lesson")
                .build();
        teacherUser = userRepository.save(teacherUser);

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        LessonEntity lesson1 = LessonEntity.builder().orderIndex(1).build();
        LessonEntity lesson2 = LessonEntity.builder().orderIndex(2).build();
        ModuleEntity module = ModuleEntity.builder()
                .orderIndex(1L)
                .type(ModuleType.LESSON)
                .lessons(new ArrayList<>(List.of(lesson1, lesson2)))
                .tests(new ArrayList<>())
                .build();
        lesson1.setModule(module);
        lesson2.setModule(module);

        CourseEntity course = CourseEntity.builder()
                .teacherprofile(teacher)
                .modules(new ArrayList<>(List.of(module)))
                .build();
        module.setCourse(course);

        TrackEntity track = TrackEntity.builder()
                .courses(new ArrayList<>(List.of(course)))
                .build();
        course.setTrack(track);

        track = trackRepository.save(track);

        Map<String, Object> actual = trackService.getLastLessonOfTrack(track.getId());

        assertEquals(lesson2.getId(), actual.get("id"));
        assertEquals("LESSON", actual.get("type"));
    }

    @Test
    void getLastLessonOfTrack_shouldReturnTestWhenLastModuleIsTestType() {
        // Test Case ID: MAI-TRS-008
        UserEntity teacherUser = UserEntity.builder()
                .email("teacher-test@example.com")
                .password("password")
                .fullName("Teacher Test")
                .build();
        teacherUser = userRepository.save(teacherUser);

        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(teacherUser);
        teacher = teacheprofileRepository.save(teacher);

        TestEntity test = TestEntity.builder().name("Mini Test").build();
        ModuleEntity module = ModuleEntity.builder()
                .orderIndex(2L)
                .type(ModuleType.TEST)
                .lessons(new ArrayList<>())
                .tests(new ArrayList<>(List.of(test)))
                .build();
        test.setModule(module);

        CourseEntity course = CourseEntity.builder()
                .teacherprofile(teacher)
                .modules(new ArrayList<>(List.of(module)))
                .build();
        module.setCourse(course);

        TrackEntity track = TrackEntity.builder()
                .courses(new ArrayList<>(List.of(course)))
                .build();
        course.setTrack(track);

        track = trackRepository.save(track);

        Map<String, Object> actual = trackService.getLastLessonOfTrack(track.getId());

        assertTrue(actual.containsKey("id"));
        assertEquals(test.getId(), actual.get("id"));
        assertEquals("TEST", actual.get("type"));
    }
}
