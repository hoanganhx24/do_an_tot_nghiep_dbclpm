package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TrackConverter;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.EnrollmentRepository;
import com.mxhieu.doantotnghiep.repository.TrackRepository;
import com.mxhieu.doantotnghiep.service.CourseService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrackServiceImplTest {

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private TrackConverter trackConverter;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private TrackServiceImpl trackService;

    @Test
    void findAll_shouldConvertEveryTrackEntity() {
        // Test Case ID: MAI-TRS-001
        TrackEntity trackA = TrackEntity.builder().id(1).code("0-300").build();
        TrackEntity trackB = TrackEntity.builder().id(2).code("300-600").build();

        when(trackRepository.findAll()).thenReturn(List.of(trackA, trackB));
        when(trackConverter.toResponse(any(TrackEntity.class), eq(TrackResponse.class)))
                .thenAnswer(invocation -> TrackResponse.builder().code(invocation.getArgument(0, TrackEntity.class).getCode()).build());

        List<TrackResponse> result = trackService.findAll("ALL");

        assertEquals(2, result.size());
        assertEquals("0-300", result.get(0).getCode());
        assertEquals("300-600", result.get(1).getCode());
    }

    @Test
    void getCoursesByTrackCode_shouldThrowWhenTrackNotFound() {
        // Test Case ID: MAI-TRS-002
        when(trackRepository.findByCode("NOT_FOUND")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> trackService.getCoursesByTrackCode("NOT_FOUND", "ALL"));

        assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getCoursesByTrackCode_shouldReturnConvertedTrackResponse() {
        // Test Case ID: MAI-TRS-003
        TrackEntity track = TrackEntity.builder().id(1).code("0-300").build();
        TrackResponse expected = TrackResponse.builder().code("0-300").name("Starter").build();

        when(trackRepository.findByCode("0-300")).thenReturn(Optional.of(track));
        when(trackConverter.toTrackResponseWithCourses(track, "ALL")).thenReturn(expected);

        TrackResponse actual = trackService.getCoursesByTrackCode("0-300", "ALL");

        assertEquals("0-300", actual.getCode());
        assertEquals("Starter", actual.getName());
    }

    @Test
    void trackDauTienChuaHoanThanhVaMoKhoa_shouldThrowWhenStudentHasNoEnrollment() {
        // Test Case ID: MAI-TRS-004
        when(enrollmentRepository.findByStudentProfile_Id(777)).thenReturn(List.of());

        AppException ex = assertThrows(AppException.class, () -> trackService.trackDauTienChuaHoanThanhVaMoKhoa(777));

        assertEquals(ErrorCode.STUDENT_NOT_HAVE_ENROLLMENT, ex.getErrorCode());
    }

    @Test
    void trackDauTienChuaHoanThanhVaMoKhoa_shouldReturnUnlockedTrackId() {
        // Test Case ID: MAI-TRS-005
        EnrollmentEntity done = EnrollmentEntity.builder().status(2).track(TrackEntity.builder().id(1).build()).build();
        EnrollmentEntity unlocked = EnrollmentEntity.builder().status(1).track(TrackEntity.builder().id(3).build()).build();

        when(enrollmentRepository.findByStudentProfile_Id(123)).thenReturn(List.of(done, unlocked));

        Integer actual = trackService.trackDauTienChuaHoanThanhVaMoKhoa(123);

        assertEquals(3, actual);
    }

    @Test
    void getLastLessonOfTrack_shouldThrowWhenTrackNotFound() {
        // Test Case ID: MAI-TRS-006
        when(trackRepository.findById(88)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> trackService.getLastLessonOfTrack(88));

        assertEquals(ErrorCode.TRACK_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getLastLessonOfTrack_shouldReturnLastLessonWhenLastModuleIsLessonType() {
        // Test Case ID: MAI-TRS-007
        LessonEntity lesson1 = LessonEntity.builder().id(11).orderIndex(1).build();
        LessonEntity lesson2 = LessonEntity.builder().id(12).orderIndex(2).build();
        ModuleEntity module = ModuleEntity.builder()
                .id(1)
                .orderIndex(1L)
                .type(ModuleType.LESSON)
            .lessons(new ArrayList<>(List.of(lesson1, lesson2)))
            .tests(new ArrayList<>())
                .build();
        CourseEntity course = CourseEntity.builder().id(10).modules(new ArrayList<>(List.of(module))).build();
        TrackEntity track = TrackEntity.builder().id(1).courses(new ArrayList<>(List.of(course))).build();

        when(trackRepository.findById(1)).thenReturn(Optional.of(track));

        Map<String, Object> actual = trackService.getLastLessonOfTrack(1);

        assertEquals(12, actual.get("id"));
        assertEquals("LESSON", actual.get("type"));
    }

    @Test
    void getLastLessonOfTrack_shouldReturnTestWhenLastModuleIsTestType() {
        // Test Case ID: MAI-TRS-008
        TestEntity test = TestEntity.builder().id(22).name("Mini Test").build();
        ModuleEntity module = ModuleEntity.builder()
                .id(2)
                .orderIndex(2L)
                .type(ModuleType.TEST)
            .lessons(new ArrayList<>())
            .tests(new ArrayList<>(List.of(test)))
                .build();
        CourseEntity course = CourseEntity.builder().id(20).modules(new ArrayList<>(List.of(module))).build();
        TrackEntity track = TrackEntity.builder().id(2).courses(new ArrayList<>(List.of(course))).build();

        when(trackRepository.findById(2)).thenReturn(Optional.of(track));

        Map<String, Object> actual = trackService.getLastLessonOfTrack(2);

        assertTrue(actual.containsKey("id"));
        assertEquals(22, actual.get("id"));
        assertEquals("TEST", actual.get("type"));
    }
}
