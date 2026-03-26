package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.AssessmentRequest;
import com.mxhieu.doantotnghiep.dto.response.AssessmentOptionResponse;
import com.mxhieu.doantotnghiep.dto.response.AssessmentQuestionResponse;
import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.entity.AssessmentEntity;
import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AssessmentConverter extends BaseConverter<AssessmentEntity, AssessmentRequest, AssessmentResponse> {
    @Autowired
    ModelMapper modelMapper;
    public List<AssessmentResponse> toResponseSummaryList(List<AssessmentEntity> assessments) {
        List<AssessmentResponse> assessmentResponses = new ArrayList<>();
        for (AssessmentEntity entity : assessments) {
            AssessmentResponse assessmentResponse =AssessmentResponse.builder()
                    .id(entity.getId())
                    .title(entity.getTitle())
                    .typeName(entity.getExercisetype().getDescription())
                    .build();
            assessmentResponses.add(assessmentResponse);
        }
        return assessmentResponses;
    }
    public AssessmentResponse toAssessmentDetailResponse(AssessmentEntity assessmentEntity) {
        AssessmentResponse assessmentResponse = toResponse(assessmentEntity, AssessmentResponse.class);
        assessmentResponse.setTestId(assessmentEntity.getTest().getId());
        assessmentResponse.setTypeName(assessmentEntity.getExercisetype().getDescription());
        List<AssessmentQuestionResponse> assessmentQuestionResponses = new ArrayList<>();
        assessmentEntity.getAssessmentQuestions().stream().forEach(assessmentQuestionEntity -> {
            AssessmentQuestionResponse assessmentQuestionResponse = new AssessmentQuestionResponse();
            assessmentQuestionResponse.setId(assessmentQuestionEntity.getId());
            assessmentQuestionResponse.setQuestionText(assessmentQuestionEntity.getStem());
            assessmentQuestionResponse.setExplain(assessmentQuestionEntity.getExplain());
            assessmentQuestionResponse.setMediData(assessmentQuestionEntity.getMediData());
            List<AssessmentOptionResponse> optionResponses = new ArrayList<>();
            assessmentQuestionEntity.getAssessmentOptions().stream().forEach(assessmentOptionEntity -> {
                AssessmentOptionResponse assessmentOptionResponse = AssessmentOptionResponse.builder()
                        .content(assessmentOptionEntity.getContent())
                        .id(assessmentOptionEntity.getId())
                        .isCorrect(assessmentOptionEntity.getIsCorrect())
                        .build();
                optionResponses.add(assessmentOptionResponse);
            });
            assessmentQuestionResponse.setChoices(optionResponses);
            assessmentQuestionResponses.add(assessmentQuestionResponse);
        });
        assessmentResponse.setAssessmentQuestions(assessmentQuestionResponses);
        return assessmentResponse;
    }

    public List<AssessmentResponse> toSplitAssessmentDetailResponse(AssessmentEntity assessmentEntity) {
        List<AssessmentResponse> assessmentResponses = new ArrayList<>();
        assessmentEntity.getAssessmentQuestions().stream().forEach(assessmentQuestionEntity -> {
            AssessmentEntity assessmentEntityCoppy = modelMapper.map(assessmentEntity, AssessmentEntity.class);
            assessmentEntityCoppy.setAssessmentQuestions(List.of(assessmentQuestionEntity));
            assessmentResponses.add(toAssessmentDetailResponse(assessmentEntityCoppy));
        });
        return assessmentResponses;
    }
}
