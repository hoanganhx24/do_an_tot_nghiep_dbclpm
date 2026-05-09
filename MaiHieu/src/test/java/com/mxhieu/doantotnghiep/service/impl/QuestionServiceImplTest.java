package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.Application;
import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.entity.ChoiceEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.entity.QuestionEntity;
import com.mxhieu.doantotnghiep.repository.ExerciseRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import com.mxhieu.doantotnghiep.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = Application.class)
@Transactional
@Rollback
class QuestionServiceImplTest {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    @Autowired
    private QuestionServiceImpl service;

    @Test
    void createQuestionAndChoices_shouldThrowWhenExerciseNotFound() {
        // Test Case ID: MAI-QUS-001
        QuestionRequest request = QuestionRequest.builder().exerciseId(-9999).build();

        assertThrows(RuntimeException.class, () -> service.createQuestionAndChoices(request, null));
    }

    @Test
    void createQuestionAndChoices_shouldCreateTwoOptionsForTrueFalseType() {
        // Test Case ID: MAI-QUS-002
        ExerciseEntity exercise = createExercise("TRUE_FALSE");

        QuestionRequest request = QuestionRequest.builder()
                .exerciseId(exercise.getId())
                .question("Q1")
                .answer("True")
                .build();

        service.createQuestionAndChoices(request, null);

        QuestionEntity savedQuestion = questionRepository.findAll().stream()
                .filter(question -> "Q1".equals(question.getQuestionText()))
                .findFirst()
                .orElseThrow();

        List<ChoiceEntity> choices = savedQuestion.getChoices();
        assertEquals(2, choices.size());
        assertTrue(choices.stream().anyMatch(c -> "True".equals(c.getContent()) && Boolean.TRUE.equals(c.getIsCorrect())));
        assertTrue(choices.stream().anyMatch(c -> "False".equals(c.getContent()) && Boolean.FALSE.equals(c.getIsCorrect())));
    }

    @Test
    void deleteQuestionAndChoies_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-QUS-003
        assertThrows(RuntimeException.class, () -> service.deleteQuestionAndChoies(-9999));
    }

    @Test
    void deleteQuestionAndChoies_shouldDeleteWhenQuestionExists() {
        // Test Case ID: MAI-QUS-004
        QuestionEntity question = createQuestion(createExercise("SINGLE_CHOICE"), "Question to delete", List.of(
                ChoiceEntity.builder().content("A").isCorrect(true).build()
        ));

        service.deleteQuestionAndChoies(question.getId());

        assertFalse(questionRepository.existsById(question.getId()));
    }

    @Test
    void updateQuestionndChoices_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-QUS-005
        QuestionRequest request = QuestionRequest.builder().id(-9999).build();

        assertThrows(RuntimeException.class, () -> service.updateQuestionndChoices(request, null));
    }

    @Test
    void updateQuestionndChoices_shouldUpdateQuestionTextAndChoices() {
        // Test Case ID: MAI-QUS-006
        ExerciseEntity exercise = createExercise("SINGLE_CHOICE");
        QuestionEntity question = createQuestion(exercise, "Old question", new ArrayList<>(List.of(
                ChoiceEntity.builder().content("Old").isCorrect(true).build()
        )));

        QuestionRequest request = QuestionRequest.builder()
                .id(question.getId())
                .question("New question")
                .options(List.of("A", "B"))
                .answer("B")
                .build();

        service.updateQuestionndChoices(request, null);

        QuestionEntity updated = questionRepository.findById(question.getId()).orElseThrow();
        assertEquals("New question", updated.getQuestionText());
        assertEquals(2, updated.getChoices().size());
        assertTrue(updated.getChoices().stream().anyMatch(c -> "A".equals(c.getContent()) && Boolean.FALSE.equals(c.getIsCorrect())));
        assertTrue(updated.getChoices().stream().anyMatch(c -> "B".equals(c.getContent()) && Boolean.TRUE.equals(c.getIsCorrect())));
    }

    private ExerciseEntity createExercise(String typeCode) {
        ExerciseTypeEntity exerciseType = exerciseTypeRepository.findByCode(typeCode)
                .orElseGet(() -> exerciseTypeRepository.save(ExerciseTypeEntity.builder()
                        .code(typeCode)
                        .description(typeCode)
                        .build()));

        return exerciseRepository.save(ExerciseEntity.builder()
                .title("Exercise " + typeCode + "-" + Math.abs(System.nanoTime() % 100000))
                .exercisetype(exerciseType)
                .orderIndex(1)
                .build());
    }

    private QuestionEntity createQuestion(ExerciseEntity exercise, String questionText, List<ChoiceEntity> choices) {
        QuestionEntity question = QuestionEntity.builder()
                .exercise(exercise)
                .questionText(questionText)
                .choices(new ArrayList<>())
                .build();

        choices.forEach(choice -> {
            choice.setQuestion(question);
            question.getChoices().add(choice);
        });

        return questionRepository.save(question);
    }
}
