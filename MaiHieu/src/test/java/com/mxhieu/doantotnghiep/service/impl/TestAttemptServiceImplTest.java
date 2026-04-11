package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TestAttemptConverter;
import com.mxhieu.doantotnghiep.dto.request.TestAttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.TestAttemptResponse;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.entity.TestAttemptEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.EnrollmentServece;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestAttemptServiceImplTest {

    @Mock
    private TestRepository testRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentQuestionRepository assessmentQuestionRepository;

    @Mock
    private EnrollmentServece enrollmentServece;

    @Mock
    private TestAttemptConverter testAttemptConverter;

    @Mock
    private AssessmentOptionRepository assessmentOptionRepository;

    @Mock
    private AssessmentAnswerRepository assessmentAnswerRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private TestAttemptServiceImpl service;

    @Test
    void saveResultFirstTest_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TAS-001
        TestAttemptRequest request = TestAttemptRequest.builder().studentProfileId(10).testId(1).assessmentAttemptRequests(new ArrayList<>()).build();
        when(studentProfileRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveResultFirstTest(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveResultFirstTest_shouldSetFirstLoginFalseAndSaveAttempt() {
        // Test Case ID: MAI-TAS-002
        StudentProfileEntity student = StudentProfileEntity.builder().id(10).firstLogin(true).build();
        TestEntity test = TestEntity.builder().id(1).build();
        TestAttemptRequest request = TestAttemptRequest.builder()
                .studentProfileId(10)
                .testId(1)
                .assessmentAttemptRequests(new ArrayList<>())
                .build();

        when(studentProfileRepository.findById(10)).thenReturn(Optional.of(student));
        when(testRepository.findById(1)).thenReturn(Optional.of(test));

        service.saveResultFirstTest(request);

        verify(studentProfileRepository).save(student);
        verify(testAttemptRepository).save(any(TestAttemptEntity.class));
        verify(enrollmentServece).saveEnrollment(any());
        assertEquals(false, student.getFirstLogin());
    }

    @Test
    void saveResultMiniTest_shouldThrowWhenTestNotFound() {
        // Test Case ID: MAI-TAS-003
        TestAttemptRequest request = TestAttemptRequest.builder().studentProfileId(10).testId(2).assessmentAttemptRequests(new ArrayList<>()).build();
        when(testRepository.findById(2)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveResultMiniTest(request));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveResultMiniTest_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TAS-004
        TestAttemptRequest request = TestAttemptRequest.builder().studentProfileId(10).testId(2).assessmentAttemptRequests(new ArrayList<>()).build();
        when(testRepository.findById(2)).thenReturn(Optional.of(TestEntity.builder().id(2).build()));
        when(studentProfileRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveResultMiniTest(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestAttemptDetailById_shouldThrowWhenAttemptNotFound() {
        // Test Case ID: MAI-TAS-005
        when(testAttemptRepository.findById(999)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getTestAttemptDetailById(999));

        assertEquals(ErrorCode.TEST_ATTEMPT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getTestAttemptDetailById_shouldReturnSummaryWhenNoAssessmentAttempt() {
        // Test Case ID: MAI-TAS-006
        TestAttemptEntity entity = TestAttemptEntity.builder().id(1).assessmentAttempts(new ArrayList<>()).build();
        TestAttemptResponse response = TestAttemptResponse.builder().id(1).build();

        when(testAttemptRepository.findById(1)).thenReturn(Optional.of(entity));
        when(testAttemptConverter.toResponseSummery(entity)).thenReturn(response);

        TestAttemptResponse actual = service.getTestAttemptDetailById(1);

        assertEquals(1, actual.getId());
        assertEquals(0, actual.getAssessmentResponses().size());
    }
}
