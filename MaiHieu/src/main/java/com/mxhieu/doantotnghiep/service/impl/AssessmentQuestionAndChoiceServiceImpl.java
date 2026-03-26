package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.AssessmentOptionRequest;
import com.mxhieu.doantotnghiep.dto.request.AssessmentQuestionRequest;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.AssessmentQuestionRepository;
import com.mxhieu.doantotnghiep.repository.AssessmentRepository;
import com.mxhieu.doantotnghiep.service.AssessmentQuestionAndChoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AssessmentQuestionAndChoiceServiceImpl implements AssessmentQuestionAndChoiceService {
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;


    @Override
    public void createQuestionAndChoices(AssessmentQuestionRequest questionRequest, MultipartFile file) {
        AssessmentEntity assessmentEntity = assessmentRepository.findById(questionRequest.getAssessmentId()).orElseThrow(()-> new AppException(ErrorCode.ASSESSMENT_NOT_FOUND));
        AssessmentQuestionEntity questionEntity = AssessmentQuestionEntity.builder()
                .assessment(assessmentEntity)
                .stem(questionRequest.getQuestion())
                .explain(questionRequest.getExplain())
                .build();
        if(assessmentEntity.getExercisetype().getCode().equals("LISTENING_1")){
            try {
                questionEntity.setMediData(file.getBytes());

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        List<AssessmentOptionEntity> choiceEntities;
        switch (assessmentEntity.getExercisetype().getCode()) {
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
        questionEntity.setAssessmentOptions(choiceEntities);
        assessmentQuestionRepository.save(questionEntity);
    }

    @Transactional
    @Override
    public void updateQuestionndChoices(AssessmentQuestionRequest questionRequest, MultipartFile file) {

        AssessmentQuestionEntity assessmentQuestionEntity = assessmentQuestionRepository.findById(questionRequest.getId()).orElseThrow(()-> new AppException(ErrorCode.ASSESSMENT_QUESSTION_NOT_FOUND));
        AssessmentEntity assessmentEntity = assessmentQuestionEntity.getAssessment();

        if(questionRequest.getQuestion() != null && !questionRequest.getQuestion().equals("")){
            assessmentQuestionEntity.setStem(questionRequest.getQuestion());
        }
        if(questionRequest.getExplain() != null && !questionRequest.getExplain().equals("")){
            assessmentQuestionEntity.setExplain(questionRequest.getExplain());
        }


        if(assessmentEntity.getExercisetype().getCode().equals("LISTENING_1")){
            if(file != null){
                try {
                    assessmentQuestionEntity.setMediData(file.getBytes());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        updateChoices(assessmentQuestionEntity, questionRequest.getChoices(),questionRequest.getAnswer());
        assessmentQuestionRepository.save(assessmentQuestionEntity);
    }

    private void updateChoices(AssessmentQuestionEntity assessmentQuestionEntity, List<AssessmentOptionRequest> content, Object answer) {
        List<AssessmentOptionEntity> existingOptions = assessmentQuestionEntity.getAssessmentOptions();

        // Danh sách ID mới gửi lên
        List<Integer> newIds = content.stream()
                .map(AssessmentOptionRequest::getId)
                .filter(id -> id != null)
                .toList();

        // Xóa options cũ không nằm trong newIds
        existingOptions.removeIf(opt ->
                opt.getId() != null && !newIds.contains(opt.getId())
        );
        // Cập nhật hoặc thêm mới options
        for (AssessmentOptionRequest optionRequest : content) {
            if (optionRequest.getId() != null) {
                // Cập nhật option tồn tại
                for (AssessmentOptionEntity existingOption : existingOptions) {
                    if(existingOption.getId().equals(optionRequest.getId())){
                        existingOption.setContent(optionRequest.getContent());
                        if(answer instanceof List){
                            existingOption.setIsCorrect(((List<?>) answer).contains(optionRequest.getContent()));
                        }else{
                            existingOption.setIsCorrect(((String) answer).equals(optionRequest.getContent()));
                        }
                    }
                }
            }else{
                // Thêm mới option
                AssessmentOptionEntity newOption = AssessmentOptionEntity.builder()
                        .assessmentQuestion(assessmentQuestionEntity)
                        .content(optionRequest.getContent())
                        .build();
                if(answer instanceof List){
                    newOption.setIsCorrect(((List<?>) answer).contains(optionRequest.getContent()));
                }else{
                    newOption.setIsCorrect(((String) answer).equals(optionRequest.getContent()));
                }
                existingOptions.add(newOption);
            }
        }
    }

    @Override
    public void deleteAssessmentQuestionById(Integer id) {
        assessmentQuestionRepository.deleteById(id);
    }

    private List<AssessmentOptionEntity> createChoices(AssessmentQuestionEntity questionEntity, List<String> content, Object answer) {
        List<AssessmentOptionEntity> choiceEntities = new ArrayList<>();
        if(content != null) {
            for(String option : content) {
                AssessmentOptionEntity choiceEntity = AssessmentOptionEntity.builder()
                        .assessmentQuestion(questionEntity)
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
                AssessmentOptionEntity choiceEntity = AssessmentOptionEntity.builder()
                        .assessmentQuestion(questionEntity)
                        .content(option)
                        .isCorrect(true)
                        .build();
                choiceEntities.add(choiceEntity);
            }
        }
        return choiceEntities;
    }
}
