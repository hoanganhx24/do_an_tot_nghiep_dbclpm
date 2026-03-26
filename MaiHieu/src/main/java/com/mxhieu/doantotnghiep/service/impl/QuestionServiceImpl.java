package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.entity.ChoiceEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import com.mxhieu.doantotnghiep.entity.MediaQuestionEntity;
import com.mxhieu.doantotnghiep.entity.QuestionEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.ChoiceRepository;
import com.mxhieu.doantotnghiep.repository.ExerciseRepository;
import com.mxhieu.doantotnghiep.repository.MediaQuestionRepository;
import com.mxhieu.doantotnghiep.repository.QuestionRepository;
import com.mxhieu.doantotnghiep.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final MediaQuestionRepository mediaQuestionRepository;
    private final ChoiceRepository choiceRepository;

    private final ExerciseRepository exerciseRepository;
    @Override
    public void createQuestionAndChoices(QuestionRequest questionRequest, MultipartFile file) {
        ExerciseEntity exerciseEntity = exerciseRepository.findById(questionRequest.getExerciseId()).orElseThrow(()-> new RuntimeException("Exercise not found"));
        QuestionEntity questionEntity = QuestionEntity.builder()
                .exercise(exerciseEntity)
                .questionText(questionRequest.getQuestion())
                .explain(questionRequest.getExplain())
                .build();

        if(exerciseEntity.getExercisetype().getCode().equals("LISTENING_1")){
            try {
                MediaQuestionEntity mediaQuestionEntity = MediaQuestionEntity.builder()
                        .mediaData(file.getBytes())
                        .type(file.getContentType())
                        .build();
                mediaQuestionRepository.save(mediaQuestionEntity);
                questionEntity.setMediaQuestion(mediaQuestionEntity);

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        List<ChoiceEntity> choiceEntities;
        switch (exerciseEntity.getExercisetype().getCode()) {
            case "TRUE_FALSE": {
                List<String> options = List.of("True", "False");
                choiceEntities = createChoices(questionEntity, options,questionRequest.getAnswer());
                break;
            }
            case "MULTIPLE_CHOICE":
            case "SINGLE_CHOICE":
            case "INTERACTIVE":
            case "LISTENING_1":
            case "LISTENING_2":
            case "LISTENING_3_4":
            case "READING_5":
            case "READING_6":
            case "READING_7":{
                choiceEntities = createChoices(questionEntity, questionRequest.getOptions(), questionRequest.getAnswer());
                break;
            }
            case "FILL_IN_THE_BLANK":{
                choiceEntities = createChoices(questionEntity, null, questionRequest.getAnswer());
                break;
            }
            default:
                choiceEntities = new ArrayList<>();
        }
        questionEntity.setChoices(choiceEntities);
        questionRepository.save(questionEntity);
    }


    @Override
    public void deleteQuestionAndChoies(int id) {
        QuestionEntity questionEntity = questionRepository.findById(id).orElseThrow(()-> new RuntimeException("Question not found"));
        questionRepository.delete(questionEntity);
    }

    @Transactional
    @Override
    public void updateQuestionndChoices(QuestionRequest questionRequest, MultipartFile file) {
        QuestionEntity questionEntity = questionRepository.findById(questionRequest.getId()).orElseThrow(()-> new RuntimeException("Question not found"));
        ExerciseEntity exerciseEntity = questionEntity.getExercise();
        questionEntity.getChoices().clear();
        questionRepository.flush();  // rất quan trọng!


        if(questionRequest.getQuestion() != null && !questionRequest.getQuestion().equals("")){
            questionEntity.setQuestionText(questionRequest.getQuestion());
        }
        if(questionRequest.getExplain() != null && !questionRequest.getExplain().equals("")){
            questionEntity.setExplain(questionRequest.getExplain());
        }


        if(exerciseEntity.getExercisetype().getCode().equals("LISTENING_1")){
            try {
                if(file != null){
                    MediaQuestionEntity mediaQuestionEntity = questionEntity.getMediaQuestion();
                    mediaQuestionEntity.setMediaData(file.getBytes());
                    mediaQuestionRepository.save(mediaQuestionEntity);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        List<ChoiceEntity> choiceEntities;
        switch (exerciseEntity.getExercisetype().getCode()) {
            case "TRUE_FALSE": {
                List<String> options = List.of("True", "False");
                choiceEntities = createChoices(questionEntity, options,questionRequest.getAnswer());
                break;
            }
            case "MULTIPLE_CHOICE":
            case "SINGLE_CHOICE":
            case "INTERACTIVE":
            case "LISTENING_1":
            case "LISTENING_2":
            case "LISTENING_3_4":
            case "READING_5":
            case "READING_6":
            case "READING_7":{
                choiceEntities = createChoices(questionEntity, questionRequest.getOptions(), questionRequest.getAnswer());
                break;
            }
            case "FILL_IN_THE_BLANK":{
                choiceEntities = createChoices(questionEntity, null, questionRequest.getAnswer());
                break;
            }
            default:
                choiceEntities = new ArrayList<>();
        }
        List<ChoiceEntity> choiceEntitiesNow = questionEntity.getChoices();
        for (ChoiceEntity choiceEntity : choiceEntities) {
            choiceEntitiesNow.add(choiceEntity);
        }
        questionRepository.save(questionEntity);
    }

    private List<ChoiceEntity> createChoices(QuestionEntity questionEntity, List<String> content, Object answer) {
        List<ChoiceEntity> choiceEntities = new ArrayList<>();
        if(content != null) {
            for(String option : content) {
                ChoiceEntity choiceEntity = ChoiceEntity.builder()
                        .question(questionEntity)
                        .content(option)
                        .build();
                if(answer instanceof List){
                    choiceEntity.setIsCorrect(((List<?>) answer).contains(option));
                }else{
                    choiceEntity.setIsCorrect(((String) answer).equals(option));
                }
                choiceEntities.add(choiceEntity);
            }
        }else{
            for(String option : (List<String>)answer) {
                ChoiceEntity choiceEntity = ChoiceEntity.builder()
                        .question(questionEntity)
                        .content(option)
                        .isCorrect(true)
                        .build();
                choiceEntities.add(choiceEntity);
            }
        }
        return choiceEntities;
    }
}
