package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.AssessmentConverter;
import com.mxhieu.doantotnghiep.dto.request.AssessmentRequest;
import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;
import com.mxhieu.doantotnghiep.entity.AssessmentEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.AssessmentRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceImplTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private AssessmentConverter assessmentConverter;

    @Mock
    private ExerciseTypeRepository exerciseTypeRepository;

    @InjectMocks
    private AssessmentServiceImpl service;

    @Test
    void createAssessment_shouldThrowWhenExerciseTypeNotFound() {
        // Test Case ID: MAI-ASS-001
        AssessmentRequest request = AssessmentRequest.builder().type("READING_5").testId(10).build();
        when(exerciseTypeRepository.findByCode("READING_5")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createAssessment(request));

        assertEquals(ErrorCode.EXERCISE_TYPE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createAssessment_shouldThrowWhenTestNotFound() {
        // Test Case ID: MAI-ASS-002
        AssessmentRequest request = AssessmentRequest.builder().type("READING_5").testId(10).build();
        when(exerciseTypeRepository.findByCode("READING_5"))
                .thenReturn(Optional.of(ExerciseTypeEntity.builder().code("READING_5").build()));
        when(testRepository.findById(10)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createAssessment(request));

        assertEquals(ErrorCode.TEST_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createAssessment_shouldAssignTestAndTypeBeforeSave() {
        // Test Case ID: MAI-ASS-003
        AssessmentRequest request = AssessmentRequest.builder().type("READING_5").testId(10).title("Title").build();
        ExerciseTypeEntity type = ExerciseTypeEntity.builder().id(1).code("READING_5").build();
        TestEntity test = TestEntity.builder().id(10).name("Mini").build();
        AssessmentEntity mappedEntity = AssessmentEntity.builder().title("Title").build();

        when(exerciseTypeRepository.findByCode("READING_5")).thenReturn(Optional.of(type));
        when(testRepository.findById(10)).thenReturn(Optional.of(test));
        when(assessmentConverter.toEntity(request, AssessmentEntity.class)).thenReturn(mappedEntity);

        service.createAssessment(request);

        ArgumentCaptor<AssessmentEntity> captor = ArgumentCaptor.forClass(AssessmentEntity.class);
        verify(assessmentRepository).save(captor.capture());
        assertSame(test, captor.getValue().getTest());
        assertSame(type, captor.getValue().getExercisetype());
    }

    @Test
    void updateAssessment_shouldThrowWhenAssessmentNotFound() {
        // Test Case ID: MAI-ASS-004
        AssessmentRequest request = AssessmentRequest.builder().id(999).build();
        when(assessmentRepository.findById(999)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.updateAssessment(request));

        assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void updateAssessment_shouldOnlyUpdateProvidedFields() {
        // Test Case ID: MAI-ASS-005
        AssessmentEntity entity = AssessmentEntity.builder()
                .id(1)
                .title("old")
                .paragraphs(List.of("old"))
                .build();

        AssessmentRequest request = AssessmentRequest.builder()
                .id(1)
                .title("new")
                .paragraphs(List.of("p1", "p2"))
                .build();

        when(assessmentRepository.findById(1)).thenReturn(Optional.of(entity));

        service.updateAssessment(request);

        verify(assessmentRepository).save(entity);
        assertEquals("new", entity.getTitle());
        assertEquals(2, entity.getParagraphs().size());
    }

    @Test
    void getSummaryAssessmentsByTestId_shouldReturnConverterResult() {
        // Test Case ID: MAI-ASS-006
        List<AssessmentEntity> entities = List.of(AssessmentEntity.builder().id(1).build());
        List<AssessmentResponse> expected = List.of(AssessmentResponse.builder().id(1).title("A1").build());

        when(assessmentRepository.findByTestId(12)).thenReturn(entities);
        when(assessmentConverter.toResponseSummaryList(entities)).thenReturn(expected);

        List<AssessmentResponse> actual = service.getSummaryAssessmentsByTestId(12);

        assertSame(expected, actual);
    }

    @Test
    void getAssessmentDetailById_shouldThrowWhenNotFound() {
        // Test Case ID: MAI-ASS-007
        when(assessmentRepository.findById(77)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.getAssessmentDetailById(77));

        assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getAssessmentDetailById_shouldReturnDetailedResponse() {
        // Test Case ID: MAI-ASS-008
        AssessmentEntity entity = AssessmentEntity.builder().id(9).build();
        AssessmentResponse expected = AssessmentResponse.builder().id(9).title("Detail").build();

        when(assessmentRepository.findById(9)).thenReturn(Optional.of(entity));
        when(assessmentConverter.toAssessmentDetailResponse(entity)).thenReturn(expected);

        AssessmentResponse actual = service.getAssessmentDetailById(9);

        assertEquals(9, actual.getId());
        assertEquals("Detail", actual.getTitle());
    }

    @Test
    void deleteAssessmentById_shouldDelegateToRepository() {
        // Test Case ID: MAI-ASS-009
        service.deleteAssessmentById(55);

        verify(assessmentRepository).deleteById(55);
    }

    @Test
    void getAssessmentDetailForFistTest_shouldThrowWhenNoValidTestFound() {
        // Test Case ID: MAI-ASS-010
        when(testRepository.findByType("FIRST_TEST")).thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.getAssessmentDetailForFistTest());

        assertEquals("No test found", ex.getMessage());
    }

    @Test
    void getAssessmentsDetailByTestId_shouldMixDetailAndSplitByExerciseType() {
        // Test Case ID: MAI-ASS-011
        AssessmentEntity listening = AssessmentEntity.builder()
                .id(1)
                .exercisetype(ExerciseTypeEntity.builder().code("LISTENING_1").build())
                .build();
        AssessmentEntity splitType = AssessmentEntity.builder()
                .id(2)
                .exercisetype(ExerciseTypeEntity.builder().code("MULTIPLE_CHOICE").build())
                .build();

        when(assessmentRepository.findByTestId(999)).thenReturn(List.of(listening, splitType));
        when(assessmentConverter.toAssessmentDetailResponse(listening))
                .thenReturn(AssessmentResponse.builder().id(1).title("L").build());
        when(assessmentConverter.toSplitAssessmentDetailResponse(splitType))
                .thenReturn(List.of(
                        AssessmentResponse.builder().id(20).title("S1").build(),
                        AssessmentResponse.builder().id(21).title("S2").build()
                ));

        List<AssessmentResponse> actual = service.getAssessmentsDetailByTestId(999);

        assertEquals(3, actual.size());
        assertEquals(1, actual.get(0).getId());
        assertEquals(20, actual.get(1).getId());
        assertEquals(21, actual.get(2).getId());
    }
}
