package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.converter.StudyPlanConverter;
import com.mxhieu.doantotnghiep.dto.response.StudyPlanResponse;
import com.mxhieu.doantotnghiep.entity.StudyPlanEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class StudyPlanServiceImplTest {

    @Autowired
    private StudyPlanServiceImpl service;

    @Autowired
    private StudyPlanRepository studyPlanRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private StudyPlanConverter studyPlanConverter;

    @Test
    void checkExistStudyPlan_shouldThrowWhenNoPlanFound() {
        // Test Case ID: MAI-STP-001
        StudentProfileEntity student = createStudentProfile("no-plan@example.com");

        AppException ex = assertThrows(AppException.class, () -> service.checkExistStudyPlan(student.getId()));

        assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkExistStudyPlan_shouldThrowWhenOnlyInactivePlansExist() {
        // Test Case ID: MAI-STP-002
        StudentProfileEntity student = createStudentProfile("inactive-only@example.com");
        studyPlanRepository.save(StudyPlanEntity.builder()
                .studentProfile(student)
                .status(1)
                .generatedAt(LocalDateTime.now())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(1, 3, 5))
                .build());

        AppException ex = assertThrows(AppException.class, () -> service.checkExistStudyPlan(student.getId()));

        assertEquals(ErrorCode.STUDYPLAN_NOT_ACTIVE, ex.getErrorCode());
    }

    @Test
    void checkExistStudyPlan_shouldReturnActiveStudyPlanId() {
        // Test Case ID: MAI-STP-003
        StudentProfileEntity student = createStudentProfile("active-plan@example.com");
        StudyPlanEntity inactive = studyPlanRepository.save(StudyPlanEntity.builder()
                .studentProfile(student)
                .status(1)
                .generatedAt(LocalDateTime.now())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(1, 3, 5))
                .build());

        StudyPlanEntity active = studyPlanRepository.save(StudyPlanEntity.builder()
                .studentProfile(student)
                .status(0)
                .generatedAt(LocalDateTime.now())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(2, 4, 6))
                .build());

        Integer id = service.checkExistStudyPlan(student.getId());

        assertEquals(active.getId(), id);
    }

    @Test
    void getStudyPlanDetail_shouldThrowWhenStudyPlanNotFound() {
        // Test Case ID: MAI-STP-004
        int missingStudyPlanId = -9999;

        AppException ex = assertThrows(AppException.class, () -> service.getStudyPlanDetail(missingStudyPlanId));

        assertEquals(ErrorCode.STUDYPLAN_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getStudyPlanDetail_shouldReturnSummaryAndEmptyItemList() {
        // Test Case ID: MAI-STP-005
        StudentProfileEntity student = createStudentProfile("detail-plan@example.com");
        StudyPlanEntity entity = studyPlanRepository.save(StudyPlanEntity.builder()
                .studentProfile(student)
                .status(0)
                .generatedAt(LocalDateTime.now())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(1, 3, 5))
                .soLuongNgayHoc(10)
                .studyPlanItems(new ArrayList<>())
                .build());

        StudyPlanResponse summary = StudyPlanResponse.builder()
                .id(entity.getId())
                .status(0)
                .studentProfileId(student.getId())
                .startDate(LocalDate.now())
                .ngayHocTrongTuan(List.of(1, 3, 5))
                .build();
        summary.setStudyPlanItems(new ArrayList<>());

        org.mockito.Mockito.when(studyPlanConverter.toResponseSummery(entity)).thenReturn(summary);

        StudyPlanResponse response = service.getStudyPlanDetail(entity.getId());

        assertEquals(entity.getId(), response.getId());
        assertEquals(0, response.getStudyPlanItems().size());
    }

    private StudentProfileEntity createStudentProfile(String email) {
        UserEntity user = userRepository.save(UserEntity.builder()
                .email(email)
                .password("password")
                .fullName("Student")
                .status("ACTIVE")
                .build());

        return studentProfileRepository.save(StudentProfileEntity.builder()
                .firstLogin(false)
                .user(user)
                .build());
    }
}
