package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AssessmentOptionRequest;
import com.mxhieu.doantotnghiep.dto.request.AssessmentQuestionRequest;
import com.mxhieu.doantotnghiep.entity.AssessmentEntity;
import com.mxhieu.doantotnghiep.entity.AssessmentOptionEntity;
import com.mxhieu.doantotnghiep.entity.AssessmentQuestionEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.AssessmentQuestionRepository;
import com.mxhieu.doantotnghiep.repository.AssessmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssessmentQuestionAndChoiceServiceImplTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentQuestionRepository assessmentQuestionRepository;

    @InjectMocks
    private AssessmentQuestionAndChoiceServiceImpl service;

    @Test
    void createQuestionAndChoices_shouldThrowWhenAssessmentNotFound() {
        // Test Case ID: MAI-AQC-001
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder().assessmentId(100).build();
        when(assessmentRepository.findById(100)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.createQuestionAndChoices(request, null));

        assertEquals(ErrorCode.ASSESSMENT_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void createQuestionAndChoices_shouldCreateTrueFalseOptions() {
        // Test Case ID: MAI-AQC-002
        AssessmentEntity assessment = AssessmentEntity.builder()
                .id(1)
                .exercisetype(ExerciseTypeEntity.builder().code("TRUE_FALSE").build())
                .build();
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder()
                .assessmentId(1)
                .question("Question")
                .explain("Explain")
                .answer("True")
                .build();

        when(assessmentRepository.findById(1)).thenReturn(Optional.of(assessment));

        service.createQuestionAndChoices(request, null);

        ArgumentCaptor<AssessmentQuestionEntity> captor = ArgumentCaptor.forClass(AssessmentQuestionEntity.class);
        verify(assessmentQuestionRepository).save(captor.capture());
        List<AssessmentOptionEntity> options = captor.getValue().getAssessmentOptions();

        assertEquals(2, options.size());
        assertTrue(options.stream().anyMatch(o -> "True".equals(o.getContent()) && Boolean.TRUE.equals(o.getIsCorrect())));
        assertTrue(options.stream().anyMatch(o -> "False".equals(o.getContent()) && Boolean.FALSE.equals(o.getIsCorrect())));
    }

    @Test
    void createQuestionAndChoices_shouldCreateFillInBlankOptionsAsCorrect() {
        // Test Case ID: MAI-AQC-003
        AssessmentEntity assessment = AssessmentEntity.builder()
                .id(2)
                .exercisetype(ExerciseTypeEntity.builder().code("FILL_IN_THE_BLANK").build())
                .build();
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder()
                .assessmentId(2)
                .question("Question")
                .answer(List.of("A", "B"))
                .build();

        when(assessmentRepository.findById(2)).thenReturn(Optional.of(assessment));

        service.createQuestionAndChoices(request, null);

        ArgumentCaptor<AssessmentQuestionEntity> captor = ArgumentCaptor.forClass(AssessmentQuestionEntity.class);
        verify(assessmentQuestionRepository).save(captor.capture());

        assertEquals(2, captor.getValue().getAssessmentOptions().size());
        assertTrue(captor.getValue().getAssessmentOptions().stream().allMatch(o -> Boolean.TRUE.equals(o.getIsCorrect())));
    }

    @Test
    void createQuestionAndChoices_shouldThrowRuntimeWhenListeningFileCannotRead() throws IOException {
        // Test Case ID: MAI-AQC-004
        AssessmentEntity assessment = AssessmentEntity.builder()
                .id(3)
                .exercisetype(ExerciseTypeEntity.builder().code("LISTENING_1").build())
                .build();
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder()
                .assessmentId(3)
                .answer("A")
                .options(List.of("A", "B"))
                .build();
        MultipartFile file = mock(MultipartFile.class);

        when(assessmentRepository.findById(3)).thenReturn(Optional.of(assessment));
        when(file.getBytes()).thenThrow(new IOException("cannot read file"));

        assertThrows(RuntimeException.class, () -> service.createQuestionAndChoices(request, file));
    }

    @Test
    void updateQuestionndChoices_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-AQC-005
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder().id(200).build();
        when(assessmentQuestionRepository.findById(200)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.updateQuestionndChoices(request, null));

        assertEquals(ErrorCode.ASSESSMENT_QUESSTION_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void updateQuestionndChoices_shouldUpdateExistingOptionAndAppendNewOption() {
        // Test Case ID: MAI-AQC-006
        AssessmentOptionEntity existingOption = AssessmentOptionEntity.builder()
                .id(1)
                .content("A")
                .isCorrect(false)
                .build();
        AssessmentEntity assessment = AssessmentEntity.builder()
                .id(4)
                .exercisetype(ExerciseTypeEntity.builder().code("SINGLE_CHOICE").build())
                .build();
        AssessmentQuestionEntity question = AssessmentQuestionEntity.builder()
                .id(10)
                .assessment(assessment)
                .assessmentOptions(new ArrayList<>(List.of(existingOption)))
                .build();

        AssessmentOptionRequest updated = AssessmentOptionRequest.builder().id(1).content("A1").build();
        AssessmentOptionRequest added = AssessmentOptionRequest.builder().content("B").build();
        AssessmentQuestionRequest request = AssessmentQuestionRequest.builder()
                .id(10)
                .question("New question")
                .choices(List.of(updated, added))
                .answer("B")
                .build();

        when(assessmentQuestionRepository.findById(10)).thenReturn(Optional.of(question));

        service.updateQuestionndChoices(request, null);

        ArgumentCaptor<AssessmentQuestionEntity> captor = ArgumentCaptor.forClass(AssessmentQuestionEntity.class);
        verify(assessmentQuestionRepository).save(captor.capture());

        List<AssessmentOptionEntity> options = captor.getValue().getAssessmentOptions();
        assertEquals(2, options.size());
        assertTrue(options.stream().anyMatch(o -> "A1".equals(o.getContent()) && Boolean.FALSE.equals(o.getIsCorrect())));
        assertTrue(options.stream().anyMatch(o -> "B".equals(o.getContent()) && Boolean.TRUE.equals(o.getIsCorrect())));
    }

    @Test
    void deleteAssessmentQuestionById_shouldDelegateToRepository() {
        // Test Case ID: MAI-AQC-007
        service.deleteAssessmentQuestionById(500);

        verify(assessmentQuestionRepository).deleteById(500);
    }
}
