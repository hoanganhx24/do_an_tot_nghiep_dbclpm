package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.LessonService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class LessonProgressServiceImplTest {

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestProgressRepository testProgressRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private LessonService lessonService;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentCourseRepository enrollmentCourseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private TrackRepository trackRepository;

    @InjectMocks
    private LessonProgressServiceImpl service;

    @Test
    void checkCompletionCondition_shouldThrowWhenLessonNotFound() {
        // Test Case ID: MAI-LPS-001
        LessonProgressRequest request = LessonProgressRequest.builder().lessonId(1).studentProfileId(2).build();
        when(lessonRepository.findById(1)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-LPS-002
        LessonProgressRequest request = LessonProgressRequest.builder().lessonId(1).studentProfileId(2).build();
        when(lessonRepository.findById(1)).thenReturn(Optional.of(LessonEntity.builder().id(1).build()));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldThrowWhenProgressRecordMissing() {
        // Test Case ID: MAI-LPS-003
        LessonProgressRequest request = LessonProgressRequest.builder().lessonId(1).studentProfileId(2).build();
        when(lessonRepository.findById(1)).thenReturn(Optional.of(LessonEntity.builder().id(1).build()));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(StudentProfileEntity.builder().id(2).build()));
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of());

        AppException ex = assertThrows(AppException.class, () -> service.checkCompletionCondition(request));

        assertEquals(ErrorCode.LESSON_PROGRESS_NOT_EXISTS, ex.getErrorCode());
    }

    @Test
    void checkCompletionCondition_shouldReturnFalseWhenGatingRuleNotReached() {
        // Test Case ID: MAI-LPS-004
        LessonEntity lesson = LessonEntity.builder().id(1).gatingRules(80).exercises(List.of()).build();
        StudentProfileEntity student = StudentProfileEntity.builder().id(2).build();
        LessonProgressEntity progress = LessonProgressEntity.builder().id(3).process(0).percentageWatched(10).build();
        LessonProgressRequest request = LessonProgressRequest.builder().lessonId(1).studentProfileId(2).percentageWatched(50).build();

        when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student));
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress));

        boolean result = service.checkCompletionCondition(request);

        assertFalse(result);
        assertEquals(1, progress.getProcess());
        verify(lessonProgressRepository).save(progress);
    }

    @Test
    void checkCompletionCondition_shouldReturnTrueWhenCompletedAndUnlockByFallback() {
        // Test Case ID: MAI-LPS-005
        CourseEntity course = CourseEntity.builder().id(99).build();
        ModuleEntity module = ModuleEntity.builder().id(50).course(course).build();
        LessonEntity lesson = LessonEntity.builder().id(1).module(module).gatingRules(50).exercises(List.of()).build();
        StudentProfileEntity student = StudentProfileEntity.builder().id(2).build();
        LessonProgressEntity progress = LessonProgressEntity.builder().id(3).process(0).percentageWatched(40).build();
        LessonProgressRequest request = LessonProgressRequest.builder().lessonId(1).studentProfileId(2).percentageWatched(60).build();

        when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson));
        when(studentProfileRepository.findById(2)).thenReturn(Optional.of(student));
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 2)).thenReturn(List.of(progress));
        when(lessonService.getNextLessonOrTest(any(LessonOrTestAroundRequest.class)))
                .thenThrow(new AppException(ErrorCode.LESSON_NOT_HAS_NEXT));
        when(enrollmentCourseRepository.findByCourse_IdAndEnrollment_StudentProfile_Id(99, 2)).thenReturn(List.of());

        boolean result = service.checkCompletionCondition(request);

        assertTrue(result);
        assertEquals(2, progress.getProcess());
        verify(lessonProgressRepository).save(progress);
    }
}
