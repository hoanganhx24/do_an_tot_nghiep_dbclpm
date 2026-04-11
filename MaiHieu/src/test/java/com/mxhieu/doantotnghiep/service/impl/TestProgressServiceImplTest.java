package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.TestProgressRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.LessonProgressService;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.TrackService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestProgressServiceImplTest {

    @Mock
    private TestProgressRepository testProgressRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private LessonService lessonService;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private LessonProgressService lessonProgressService;

    @Mock
    private TrackService trackService;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private TestProgressServiceImpl service;

    @Test
    void checkCompletionCondition_shouldThrowWhenTestNotFound() {
        // Test Case ID: MAI-TPR-001
        TestProgressRequest request = TestProgressRequest.builder().testId(1).studentprofileId(2).build();
        when(testRepository.findById(1)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-TPR-002
        TestProgressRequest request = TestProgressRequest.builder().testId(1).studentprofileId(2).build();
        when(testRepository.findById(1)).thenReturn(Optional.of(TestEntity.builder().id(1).build()));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenProgressRecordMissing() {
        // Test Case ID: MAI-TPR-003
        TestProgressRequest request = TestProgressRequest.builder().testId(1).studentprofileId(2).build();
        when(testRepository.findById(1)).thenReturn(Optional.of(TestEntity.builder().id(1).build()));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(StudentProfileEntity.builder().id(2).build()));
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.TEST_PROGRESS_NOT_EXISTS, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldReturnFalseWhenMaxAttemptBelowThreshold() {
        // Test Case ID: MAI-TPR-004
        TestEntity test = TestEntity.builder().id(1).build();
        StudentProfileEntity student = StudentProfileEntity.builder().id(2).build();
        TestProgressEntity progress = TestProgressEntity.builder().id(3).process(0).build();
        TestProgressRequest request = TestProgressRequest.builder().testId(1).studentprofileId(2).build();

        when(testRepository.findById(1)).thenReturn(Optional.of(test));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student));
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress));
        when(testAttemptRepository.findTopByTest_IdAndStudentProfile_IdOrderByTotalScoreDesc(1, 2))
                .thenReturn(Optional.of(TestAttemptEntity.builder().totalScore(49f).build()));

        boolean result = service.checkCompletionCondition(request);

        assertFalse(result);
        assertEquals(1, progress.getProcess());
        verify(testProgressRepository).save(progress);
    }

    @Test
    void checkCompletionCondition_shouldReturnTrueAndUseFallbackUnlockWhenNoNextItem() {
        // Test Case ID: MAI-TPR-005
        CourseEntity course = CourseEntity.builder().id(10).build();
        ModuleEntity module = ModuleEntity.builder().id(20).course(course).build();
        TestEntity test = TestEntity.builder().id(1).module(module).build();
        StudentProfileEntity student = StudentProfileEntity.builder().id(2).build();
        TestProgressEntity progress = TestProgressEntity.builder().id(3).process(0).build();
        TestProgressRequest request = TestProgressRequest.builder().testId(1).studentprofileId(2).build();

        when(testRepository.findById(1)).thenReturn(Optional.of(test));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student));
        when(testProgressRepository.findByTest_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress));
        when(testAttemptRepository.findTopByTest_IdAndStudentProfile_IdOrderByTotalScoreDesc(1, 2))
                .thenReturn(Optional.of(TestAttemptEntity.builder().totalScore(80f).build()));
        when(lessonService.getNextLessonOrTest(any(LessonOrTestAroundRequest.class)))
                .thenThrow(new AppException(ErrorCode.LESSON_NOT_HAS_NEXT));

        boolean result = service.checkCompletionCondition(request);

        assertTrue(result);
        assertEquals(2, progress.getProcess());
        verify(testProgressRepository).save(progress);
        verify(lessonProgressService).unLockNextCourse(course, student);
    }
}
