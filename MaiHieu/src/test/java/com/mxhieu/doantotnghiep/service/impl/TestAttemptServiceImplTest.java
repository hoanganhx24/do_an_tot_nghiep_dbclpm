package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.dto.request.TestAttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.TestAttemptResponse;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.TestAttemptEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.StudentProfileRepository;
import com.mxhieu.doantotnghiep.repository.TestAttemptRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import com.mxhieu.doantotnghiep.repository.UserRepository;
import com.mxhieu.doantotnghiep.service.EnrollmentServece;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class TestAttemptServiceImplTest {

    @Autowired
    private TestAttemptServiceImpl service;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    @MockBean
    private EnrollmentServece enrollmentServece;

    @Test
    void saveResultFirstTest_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TAS-001
        TestAttemptRequest request = TestAttemptRequest.builder()
                .studentProfileId(10)
                .testId(1)
                .assessmentAttemptRequests(List.of())
                .build();

        AppException ex = assertThrows(AppException.class, () -> service.saveResultFirstTest(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveResultFirstTest_shouldSetFirstLoginFalseAndSaveAttempt() {
        // Test Case ID: MAI-TAS-002
        UserEntity user = UserEntity.builder()
                .email("student-test@example.com")
                .password("password")
                .fullName("Student Test")
                .build();
        user = userRepository.save(user);

        StudentProfileEntity student = StudentProfileEntity.builder()
                .firstLogin(true)
                .user(user)
                .build();
        student = studentProfileRepository.save(student);

        TestEntity test = TestEntity.builder().name("Integration Test").build();
        test = testRepository.save(test);

        TestAttemptRequest request = TestAttemptRequest.builder()
                .studentProfileId(student.getId())
                .testId(test.getId())
                .assessmentAttemptRequests(List.of())
                .build();

        service.saveResultFirstTest(request);

        StudentProfileEntity updatedStudent = studentProfileRepository.findById(student.getId()).orElseThrow();
        List<TestAttemptEntity> savedAttempts = testAttemptRepository.findByTestIdAndStudentProfileId(test.getId(), student.getId());

        assertEquals(false, updatedStudent.getFirstLogin());
        assertEquals(1, savedAttempts.size());
        verify(enrollmentServece).saveEnrollment(any());
    }

    @Test
    void saveResultMiniTest_shouldThrowWhenTestNotFound() {
        // Test Case ID: MAI-TAS-003
        TestAttemptRequest request = TestAttemptRequest.builder()
                .studentProfileId(10)
                .testId(2)
                .assessmentAttemptRequests(List.of())
                .build();

        AppException ex = assertThrows(AppException.class, () -> service.saveResultMiniTest(request));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveResultMiniTest_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TAS-004
        TestEntity test = TestEntity.builder().name("Integration Test").build();
        test = testRepository.save(test);

        TestAttemptRequest request = TestAttemptRequest.builder()
                .studentProfileId(10)
                .testId(test.getId())
                .assessmentAttemptRequests(List.of())
                .build();

        AppException ex = assertThrows(AppException.class, () -> service.saveResultMiniTest(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestAttemptDetailById_shouldThrowWhenAttemptNotFound() {
        // Test Case ID: MAI-TAS-005
        AppException ex = assertThrows(AppException.class, () -> service.getTestAttemptDetailById(999999));

        assertEquals(ErrorCode.TEST_ATTEMPT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestAttemptDetailById_shouldReturnSummaryWhenNoAssessmentAttempt() {
        // Test Case ID: MAI-TAS-006
        UserEntity user = UserEntity.builder()
                .email("student-detail@example.com")
                .password("password")
                .fullName("Student Detail")
                .build();
        user = userRepository.save(user);

        StudentProfileEntity student = StudentProfileEntity.builder()
                .firstLogin(false)
                .user(user)
                .build();
        student = studentProfileRepository.save(student);

        TestEntity test = TestEntity.builder().name("Integration Test").build();
        test = testRepository.save(test);

        TestAttemptEntity entity = TestAttemptEntity.builder()
                .studentProfile(student)
                .test(test)
                .assessmentAttempts(List.of())
                .totalScore(0f)
                .testAt(LocalDateTime.now())
                .build();
        entity = testAttemptRepository.save(entity);

        TestAttemptResponse actual = service.getTestAttemptDetailById(entity.getId());

        assertEquals(entity.getId(), actual.getId());
        assertEquals(0, actual.getAssessmentResponses().size());
    }
}
