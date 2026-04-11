package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.ExerciseConverter;
import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.MediaAssetEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExerciseServiceImplTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseTypeRepository exerciseTypeRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ExerciseConverter exerciseConverter;

    @Mock
    private AttemptAnswerRepository attemptAnswerRepository;

    @Mock
    private AttemptRepository attemptRepository;

    @InjectMocks
    private ExerciseServiceImpl service;

    @Test
    void getExerciseDetailById_shouldThrowWhenExerciseNotFound() {
        // Test Case ID: MAI-EXS-001
        when(exerciseRepository.findById(1)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getExerciseDetailById(1, 1));

        assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createExercise_shouldThrowWhenLessonNotFound() {
        // Test Case ID: MAI-EXS-002
        ExerciseRequest request = ExerciseRequest.builder().lessonID(10).type("READING_5").build();
        when(lessonRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createExercise(request));

        assertEquals(ErrorCode.LESSON_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createExercise_shouldThrowWhenExerciseTypeNotFound() {
        // Test Case ID: MAI-EXS-003
        ExerciseRequest request = ExerciseRequest.builder().lessonID(10).type("UNKNOWN_TYPE").build();
        when(lessonRepository.findById(10)).thenReturn(Optional.of(LessonEntity.builder().id(10).build()));
        when(exerciseTypeRepository.findByCode("UNKNOWN_TYPE")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createExercise(request));

        assertEquals(ErrorCode.EXERCISE_TYPE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createExercise_shouldThrowWhenShowTimeButLessonHasNoMedia() {
        // Test Case ID: MAI-EXS-004
        LessonEntity lesson = LessonEntity.builder().id(10).mediaassets(List.of()).build();
        ExerciseTypeEntity type = ExerciseTypeEntity.builder().code("INTERACTIVE").build();
        ExerciseEntity mapped = ExerciseEntity.builder().id(1).lesson(lesson).exercisetype(type).build();

        ExerciseRequest request = ExerciseRequest.builder()
                .lessonID(10)
                .type("INTERACTIVE")
                .showTime(LocalTime.of(0, 0, 1))
                .build();

        when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson));
        when(exerciseTypeRepository.findByCode("INTERACTIVE")).thenReturn(Optional.of(type));
        when(exerciseConverter.toEntity(request, ExerciseEntity.class)).thenReturn(mapped);
        when(exerciseRepository.getMaxOrder(10)).thenReturn(0);
        when(exerciseRepository.findByLesson_IdAndExercisetype_Code(10, "INTERACTIVE")).thenReturn(List.of());

        AppException ex = assertThrows(AppException.class, () -> service.createExercise(request));

        assertEquals(ErrorCode.LESSON_NOT_HAS_MEDIA, ex.getErrorCode());
    }

    @Test
    void getSummaryExercisesByLessonId_shouldReturnConverterOutput() {
        // Test Case ID: MAI-EXS-005
        ExerciseEntity entity = ExerciseEntity.builder().id(1).build();
        ExerciseResponse response = ExerciseResponse.builder().id(1).title("E1").build();

        when(exerciseRepository.findByLessonId(3)).thenReturn(List.of(entity));
        when(exerciseConverter.toResponseSummaryList(List.of(entity))).thenReturn(List.of(response));

        List<ExerciseResponse> actual = service.getSummaryExercisesByLessonId(3);

        assertEquals(1, actual.size());
        assertEquals("E1", actual.get(0).getTitle());
    }

    @Test
    void updateExercise_shouldThrowWhenExerciseNotFound() {
        // Test Case ID: MAI-EXS-006
        ExerciseRequest request = ExerciseRequest.builder().id(99).build();
        when(exerciseRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.updateExercise(request));

        assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void deleteExcercise_shouldDelegateDeleteById() {
        // Test Case ID: MAI-EXS-007
        service.deleteExcercise(55);

        verify(exerciseRepository).deleteById(55);
    }
}
