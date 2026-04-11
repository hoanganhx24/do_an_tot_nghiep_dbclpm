package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.repository.ChoiceRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseRepository;
import com.mxhieu.doantotnghiep.repository.MediaQuestionRepository;
import com.mxhieu.doantotnghiep.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private MediaQuestionRepository mediaQuestionRepository;

    @Mock
    private ChoiceRepository choiceRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private QuestionServiceImpl service;

    @Test
    void createQuestionAndChoices_shouldThrowWhenExerciseNotFound() {
        // Test Case ID: MAI-QUS-001
        QuestionRequest request = QuestionRequest.builder().exerciseId(10).build();
        when(exerciseRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createQuestionAndChoices(request, null));
    }

    @Test
    void createQuestionAndChoices_shouldCreateTwoOptionsForTrueFalseType() {
        // Test Case ID: MAI-QUS-002
        ExerciseEntity exercise = ExerciseEntity.builder()
                .id(1)
                .exercisetype(ExerciseTypeEntity.builder().code("TRUE_FALSE").build())
                .build();

        QuestionRequest request = QuestionRequest.builder()
                .exerciseId(1)
                .question("Q1")
                .answer("True")
                .build();

        when(exerciseRepository.findById(1)).thenReturn(Optional.of(exercise));

        service.createQuestionAndChoices(request, null);

        ArgumentCaptor<QuestionEntity> captor = ArgumentCaptor.forClass(QuestionEntity.class);
        verify(questionRepository).save(captor.capture());

        List<ChoiceEntity> choices = captor.getValue().getChoices();
        assertEquals(2, choices.size());
        assertTrue(choices.stream().anyMatch(c -> "True".equals(c.getContent()) && Boolean.TRUE.equals(c.getIsCorrect())));
        assertTrue(choices.stream().anyMatch(c -> "False".equals(c.getContent()) && Boolean.FALSE.equals(c.getIsCorrect())));
    }

    @Test
    void deleteQuestionAndChoies_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-QUS-003
        when(questionRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.deleteQuestionAndChoies(99));
    }

    @Test
    void deleteQuestionAndChoies_shouldDeleteWhenQuestionExists() {
        // Test Case ID: MAI-QUS-004
        QuestionEntity question = QuestionEntity.builder().id(8).build();
        when(questionRepository.findById(8)).thenReturn(Optional.of(question));

        service.deleteQuestionAndChoies(8);

        verify(questionRepository).delete(question);
    }

    @Test
    void updateQuestionndChoices_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-QUS-005
        QuestionRequest request = QuestionRequest.builder().id(100).build();
        when(questionRepository.findById(100)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.updateQuestionndChoices(request, null));
    }

    @Test
    void updateQuestionndChoices_shouldUpdateQuestionTextAndChoices() {
        // Test Case ID: MAI-QUS-006
        ExerciseEntity exercise = ExerciseEntity.builder()
                .id(2)
                .exercisetype(ExerciseTypeEntity.builder().code("SINGLE_CHOICE").build())
                .build();
        QuestionEntity question = QuestionEntity.builder()
                .id(2)
                .exercise(exercise)
                .choices(new ArrayList<>(List.of(ChoiceEntity.builder().id(1).content("Old").build())))
                .build();

        QuestionRequest request = QuestionRequest.builder()
                .id(2)
                .question("New question")
                .options(List.of("A", "B"))
                .answer("B")
                .build();

        when(questionRepository.findById(2)).thenReturn(Optional.of(question));

        service.updateQuestionndChoices(request, null);

        verify(questionRepository).flush();
        verify(questionRepository).save(question);
        assertEquals("New question", question.getQuestionText());
        assertEquals(2, question.getChoices().size());
    }
}
