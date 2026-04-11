package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.EnrollmentConverter;
import com.mxhieu.doantotnghiep.converter.TrackConverter;
import com.mxhieu.doantotnghiep.dto.request.EnrollmentRequest;
import com.mxhieu.doantotnghiep.dto.response.EnrollmentResponst;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.EnrollmentEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServeceImplTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentCourseRepository enrollmentcourseRepository;

    @Mock
    private EnrollmentConverter enrollmentConverter;

    @Mock
    private TrackConverter trackConverter;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private TestProgressRepository testProgressRepository;

    @InjectMocks
    private EnrollmentServeceImpl service;

    @Test
    void saveEnrollment_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-ENR-001
        EnrollmentRequest request = EnrollmentRequest.builder().studentProfileId(99).score(20f).build();
        when(studentProfileRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveEnrollment(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveEnrollment_shouldCreateThreeEnrollmentsAndSetStatusByScore() {
        // Test Case ID: MAI-ENR-002
        EnrollmentRequest request = EnrollmentRequest.builder().studentProfileId(1).score(20f).build();
        StudentProfileEntity student = StudentProfileEntity.builder().id(1).build();

        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(student));
        when(trackRepository.findByCode("0-300")).thenReturn(Optional.of(TrackEntity.builder().id(1).code("0-300").build()));
        when(trackRepository.findByCode("300-600")).thenReturn(Optional.of(TrackEntity.builder().id(2).code("300-600").build()));
        when(trackRepository.findByCode("600+")).thenReturn(Optional.of(TrackEntity.builder().id(3).code("600+").build()));
        when(courseRepository.findByTrack_IdAndStatus(1, "OLD")).thenReturn(List.of());
        when(courseRepository.findByTrack_IdAndStatus(2, "OLD")).thenReturn(List.of());
        when(courseRepository.findByTrack_IdAndStatus(3, "OLD")).thenReturn(List.of());

        service.saveEnrollment(request);

        ArgumentCaptor<List<EnrollmentEntity>> captor = ArgumentCaptor.forClass(List.class);
        verify(enrollmentRepository).saveAll(captor.capture());
        List<EnrollmentEntity> saved = captor.getValue();

        assertEquals(3, saved.size());
        assertEquals(1, saved.get(0).getStatus());
        assertEquals(0, saved.get(1).getStatus());
        assertEquals(0, saved.get(2).getStatus());
    }

    @Test
    void getStudentEnrollmenteds_shouldMapSummaryAndTrackResponse() {
        // Test Case ID: MAI-ENR-003
        EnrollmentEntity enrollment = EnrollmentEntity.builder().id(5).studentProfile(StudentProfileEntity.builder().id(1).build()).build();
        EnrollmentResponst summary = EnrollmentResponst.builder().id(5).status(1).build();
        TrackResponse track = TrackResponse.builder().code("0-300").build();

        when(enrollmentRepository.findByStudentProfile_Id(1)).thenReturn(List.of(enrollment));
        when(enrollmentConverter.toResponseSummary(enrollment)).thenReturn(summary);
        when(trackConverter.toTrackForStudent(enrollment)).thenReturn(track);

        List<EnrollmentResponst> result = service.getStudentEnrollmenteds(1);

        assertEquals(1, result.size());
        assertEquals("0-300", result.get(0).getTrackResponse().getCode());
    }

    @Test
    void getPreviewStudyFlow_shouldReturnConverterOutput() {
        // Test Case ID: MAI-ENR-004
        EnrollmentEntity enrollment = EnrollmentEntity.builder().id(10).build();
        EnrollmentResponst response = EnrollmentResponst.builder().id(10).build();

        when(enrollmentRepository.findByStudentProfile_Id(9)).thenReturn(List.of(enrollment));
        when(enrollmentConverter.toStudyFlow(List.of(enrollment))).thenReturn(List.of(response));

        List<EnrollmentResponst> result = service.getPreviewStudyFlow(9);

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getId());
    }
}
