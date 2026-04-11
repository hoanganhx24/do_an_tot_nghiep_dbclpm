package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.AttemptConverter;
import com.mxhieu.doantotnghiep.dto.request.AttemptRequest;
import com.mxhieu.doantotnghiep.dto.request.AttemptanswerRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttemptSeviceImplTest {

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private AttemptConverter attemptConverter;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AttemptAnswerRepository attemptAnswerRepository;

    @Mock
    private ChoiceRepository choiceRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AttemptSeviceImpl service;

    private AttemptRequest createRequest(List<AttemptanswerRequest> answers) {
        return AttemptRequest.builder()
                .studentProfileId(1)
                .exerciseId(2)
                .attemptanswerRequests(answers)
                .build();
    }

    @Test
    void saveAttempt_shouldThrowWhenStudentNotFound() {
        // Test Case ID: MAI-ATS-001
        AttemptRequest request = createRequest(List.of(AttemptanswerRequest.builder().questionId(1).choiceId(1).build()));
        when(studentProfileRepository.findById(1)).thenReturn(Optional.empty());
        when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build()));

        AppException ex = assertThrows(AppException.class, () -> service.saveAttempt(request));

        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveAttempt_shouldThrowWhenExerciseNotFound() {
        // Test Case ID: MAI-ATS-002
        AttemptRequest request = createRequest(List.of(AttemptanswerRequest.builder().questionId(1).choiceId(1).build()));

        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build()));
        when(exerciseRepository.findById(2)).thenReturn(Optional.empty());
        when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build()));

        AppException ex = assertThrows(AppException.class, () -> service.saveAttempt(request));

        assertEquals(ErrorCode.EXERCISE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveAttempt_shouldThrowWhenChoiceNotFound() {
        // Test Case ID: MAI-ATS-003
        AttemptRequest request = createRequest(List.of(AttemptanswerRequest.builder().questionId(1).choiceId(99).build()));

        when(choiceRepository.findById(99)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveAttempt(request));

        assertEquals(ErrorCode.CHOICE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveAttempt_shouldThrowWhenQuestionNotFound() {
        // Test Case ID: MAI-ATS-004
        AttemptRequest request = createRequest(List.of(AttemptanswerRequest.builder().questionId(55).choiceId(1).build()));

        when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build()));
        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build()));
        when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build()));
        when(questionRepository.findById(55)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> service.saveAttempt(request));

        assertEquals(ErrorCode.QUESTION_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void saveAttempt_shouldCalculateScorePercentAndPersistAttempt() {
        // Test Case ID: MAI-ATS-005
        AttemptanswerRequest ans1 = AttemptanswerRequest.builder().questionId(1).choiceId(1).build();
        AttemptanswerRequest ans2 = AttemptanswerRequest.builder().questionId(2).choiceId(2).build();
        AttemptRequest request = createRequest(List.of(ans1, ans2));

        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build()));
        when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build()));
        when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build()));
        when(choiceRepository.findById(2)).thenReturn(Optional.of(ChoiceEntity.builder().id(2).isCorrect(false).build()));
        when(questionRepository.findById(1)).thenReturn(Optional.of(QuestionEntity.builder().id(1).build()));
        when(questionRepository.findById(2)).thenReturn(Optional.of(QuestionEntity.builder().id(2).build()));

        service.saveAttempt(request);

        ArgumentCaptor<AttemptEntity> captor = ArgumentCaptor.forClass(AttemptEntity.class);
        verify(attemptRepository).save(captor.capture());

        AttemptEntity saved = captor.getValue();
        assertEquals(50, saved.getScorePercent());
        assertEquals(2, saved.getAttemptAnswers().size());
        assertEquals(1, saved.getStudentProfile().getId());
        assertEquals(2, saved.getExercise().getId());
    }

    @Test
    void saveAttempt_shouldSetScoreTo100WhenAllAnswersCorrect() {
        // Test Case ID: MAI-ATS-006
        AttemptanswerRequest ans = AttemptanswerRequest.builder().questionId(1).choiceId(1).build();
        AttemptRequest request = createRequest(List.of(ans));

        when(studentProfileRepository.findById(1)).thenReturn(Optional.of(StudentProfileEntity.builder().id(1).build()));
        when(exerciseRepository.findById(2)).thenReturn(Optional.of(ExerciseEntity.builder().id(2).build()));
        when(choiceRepository.findById(1)).thenReturn(Optional.of(ChoiceEntity.builder().id(1).isCorrect(true).build()));
        when(questionRepository.findById(1)).thenReturn(Optional.of(QuestionEntity.builder().id(1).build()));

        service.saveAttempt(request);

        ArgumentCaptor<AttemptEntity> captor = ArgumentCaptor.forClass(AttemptEntity.class);
        verify(attemptRepository).save(captor.capture());
        assertEquals(100, captor.getValue().getScorePercent());
    }
}
