package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.StudyPlanConverter;
import com.mxhieu.doantotnghiep.dto.response.StudyPlanResponse;
import com.mxhieu.doantotnghiep.entity.StudyPlanEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.TestService;
import com.mxhieu.doantotnghiep.service.TrackService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudyPlanServiceImplTest {

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private EnrollmentCourseRepository enrollmentCourseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private StudyPlanRepository studyPlanRepository;

    @Mock
    private StudyPlanConverter studyPlanConverter;

    @Mock
    private LessonService lessonService;

    @Mock
    private TestService testService;

    @Mock
    private TrackService trackService;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private TestProgressRepository testProgressRepository;

    @InjectMocks
    private StudyPlanServiceImpl service;

    @Test
    void checkExistStudyPlan_shouldThrowWhenNoPlanFound() {
        // Test Case ID: MAI-STP-001
        when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of());

        AppException ex = assertThrows(AppException.class, () -> service.checkExistStudyPlan(10));

        assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkExistStudyPlan_shouldThrowWhenOnlyInactivePlansExist() {
        // Test Case ID: MAI-STP-002
        StudyPlanEntity inactive = StudyPlanEntity.builder().id(1).status(1).build();
        when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of(inactive));

        AppException ex = assertThrows(AppException.class, () -> service.checkExistStudyPlan(10));

        assertEquals(ErrorCode.STUDYPLAN_NOT_ACTIVE, ex.getErrorCode());
    }

    @Test
    void checkExistStudyPlan_shouldReturnActiveStudyPlanId() {
        // Test Case ID: MAI-STP-003
        StudyPlanEntity inactive = StudyPlanEntity.builder().id(1).status(1).build();
        StudyPlanEntity active = StudyPlanEntity.builder().id(2).status(0).build();
        when(studyPlanRepository.findByStudentProfile_Id(10)).thenReturn(List.of(inactive, active));

        Integer id = service.checkExistStudyPlan(10);

        assertEquals(2, id);
    }

    @Test
    void getStudyPlanDetail_shouldThrowWhenStudyPlanNotFound() {
        // Test Case ID: MAI-STP-004
        when(studyPlanRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getStudyPlanDetail(99));

        assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getStudyPlanDetail_shouldReturnSummaryAndEmptyItemList() {
        // Test Case ID: MAI-STP-005
        StudyPlanEntity entity = StudyPlanEntity.builder()
                .id(1)
                .status(0)
                .generatedAt(LocalDateTime.now())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(1, 3, 5))
            .studentProfile(StudentProfileEntity.builder().id(10).build())
                .studyPlanItems(new ArrayList<>())
                .build();
        StudyPlanResponse summary = StudyPlanResponse.builder().id(1).status(0).build();

        when(studyPlanRepository.findById(1)).thenReturn(Optional.of(entity));
        when(studyPlanConverter.toResponseSummery(entity)).thenReturn(summary);

        StudyPlanResponse response = service.getStudyPlanDetail(1);

        assertEquals(1, response.getId());
        assertEquals(0, response.getStudyPlanItems().size());
    }
}
