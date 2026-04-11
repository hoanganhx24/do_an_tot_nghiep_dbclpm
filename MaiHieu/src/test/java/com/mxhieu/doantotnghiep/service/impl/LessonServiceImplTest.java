package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.controller.MaterialConverter;
import com.mxhieu.doantotnghiep.controller.MediaAssetConverter;
import com.mxhieu.doantotnghiep.converter.LessonConverter;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonServiceImplTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonConverter lessonConverter;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private EnrollmentCourseRepository enrollmentcourseRepository;

    @Mock
    private MediaAssetRepository mediaAssetRepository;

    @Mock
    private MaterialConverter materialConverter;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MediaAssetConverter mediaAssetConverter;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private TestRepository testRepository;

    @InjectMocks
    private LessonServiceImpl service;

    @Test
    void getLesson_shouldThrowWhenLessonNotFound() {
        // Test Case ID: MAI-LSS-001
        when(lessonRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getLesson(10));

        assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getLesson_shouldReturnConvertedResponse() {
        // Test Case ID: MAI-LSS-002
        LessonEntity lesson = LessonEntity.builder().id(1).build();
        LessonResponse response = LessonResponse.builder().id(1).title("Lesson A").build();

        when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson));
        when(lessonConverter.toResponse(lesson, LessonResponse.class)).thenReturn(response);

        LessonResponse actual = service.getLesson(1);

        assertEquals(1, actual.getId());
        assertEquals("Lesson A", actual.getTitle());
    }

    @Test
    void getMaxOrder_shouldReturnRepositoryValuePlusOne() {
        // Test Case ID: MAI-LSS-003
        when(lessonRepository.getMaxOrder(5)).thenReturn(7);

        int max = service.getMaxOrder(5);

        assertEquals(8, max);
    }

    @Test
    void isCompletedLesson_shouldReturnFalseWhenNoProgress() {
        // Test Case ID: MAI-LSS-004
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 9)).thenReturn(List.of());

        assertFalse(service.isCompletedLesson(1, 9));
    }

    @Test
    void isCompletedLesson_shouldReturnFalseWhenProcessIsOne() {
        // Test Case ID: MAI-LSS-005
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 9))
                .thenReturn(List.of(LessonProgressEntity.builder().process(1).build()));

        assertFalse(service.isCompletedLesson(1, 9));
    }

    @Test
    void isCompletedLesson_shouldReturnTrueWhenProcessIsTwo() {
        // Test Case ID: MAI-LSS-006
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(1, 9))
                .thenReturn(List.of(LessonProgressEntity.builder().process(2).build()));

        assertTrue(service.isCompletedLesson(1, 9));
    }

    @Test
    void isLockLesson_shouldThrowWhenLessonNotFound() {
        // Test Case ID: MAI-LSS-007
        when(lessonRepository.findById(101)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.isLockLesson(101, 1));

        assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getLessonPath_shouldReturnHierarchyPath() {
        // Test Case ID: MAI-LSS-008
        TrackEntity track = TrackEntity.builder().name("Track A").build();
        CourseEntity course = CourseEntity.builder().title("Course A").track(track).build();
        ModuleEntity module = ModuleEntity.builder().title("Module A").course(course).build();
        LessonEntity lesson = LessonEntity.builder().id(20).title("Lesson A").module(module).build();

        when(lessonRepository.findById(20)).thenReturn(Optional.of(lesson));

        String actual = service.getLessonPath(20);

        assertEquals("Track A/Course A/Module A/Lesson A", actual);
    }

    @Test
    void completedStar_shouldReturnThreeWhenLessonHasNoExerciseAndIsCompleted() {
        // Test Case ID: MAI-LSS-009
        LessonEntity lesson = LessonEntity.builder().id(30).exercises(List.of()).build();

        when(lessonRepository.findById(30)).thenReturn(Optional.of(lesson));
        when(lessonProgressRepository.findByLesson_IdAndStudentProfile_Id(30, 3))
                .thenReturn(List.of(LessonProgressEntity.builder().process(2).build()));

        int stars = service.completedStar(30, 3);

        assertEquals(3, stars);
    }

    @Test
    void deleteLesson_shouldThrowWhenLessonNotFound() {
        // Test Case ID: MAI-LSS-010
        when(lessonRepository.findById(999)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.deleteLesson(999));

        assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void deleteLesson_shouldDeleteWhenFound() {
        // Test Case ID: MAI-LSS-011
        LessonEntity lesson = LessonEntity.builder().id(1000).build();
        when(lessonRepository.findById(1000)).thenReturn(Optional.of(lesson));

        service.deleteLesson(1000);

        verify(lessonRepository).delete(lesson);
    }
}
