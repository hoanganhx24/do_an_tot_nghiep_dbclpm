package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.ExerciseTypeConverter;
import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExerciseTypeServiceImplTest {

    @Mock
    private ExerciseTypeRepository exerciseTypeRepository;

    @Mock
    private ExerciseTypeConverter exerciseTypeConverter;

    @InjectMocks
    private ExerciseTypeServiceImpl exerciseTypeService;

    @Test
    void getExerciseTypes_shouldReturnMappedResponses() {
        // Test Case ID: MAI-ETS-001
        List<ExerciseTypeEntity> entities = List.of(ExerciseTypeEntity.builder().id(1).code("READING_5").build());
        List<ExerciseTypeResponse> responses = List.of(ExerciseTypeResponse.builder().id(1).code("READING_5").build());

        when(exerciseTypeRepository.findAll()).thenReturn(entities);
        when(exerciseTypeConverter.toResponseList(entities, ExerciseTypeResponse.class)).thenReturn(responses);

        List<ExerciseTypeResponse> actual = exerciseTypeService.getExerciseTypes();

        assertSame(responses, actual);
        verify(exerciseTypeRepository).findAll();
    }

    @Test
    void getExerciseTypes_shouldPassRepositoryResultToConverter() {
        // Test Case ID: MAI-ETS-002
        List<ExerciseTypeEntity> entities = List.of(ExerciseTypeEntity.builder().id(11).code("TRUE_FALSE").build());

        when(exerciseTypeRepository.findAll()).thenReturn(entities);
        when(exerciseTypeConverter.toResponseList(anyList(), eq(ExerciseTypeResponse.class))).thenReturn(Collections.emptyList());

        exerciseTypeService.getExerciseTypes();

        verify(exerciseTypeConverter).toResponseList(entities, ExerciseTypeResponse.class);
    }

    @Test
    void getExerciseTypes_shouldReturnEmptyListWhenNoEntityExists() {
        // Test Case ID: MAI-ETS-003
        when(exerciseTypeRepository.findAll()).thenReturn(Collections.emptyList());
        when(exerciseTypeConverter.toResponseList(Collections.emptyList(), ExerciseTypeResponse.class))
                .thenReturn(Collections.emptyList());

        List<ExerciseTypeResponse> actual = exerciseTypeService.getExerciseTypes();

        assertEquals(0, actual.size());
    }
}
