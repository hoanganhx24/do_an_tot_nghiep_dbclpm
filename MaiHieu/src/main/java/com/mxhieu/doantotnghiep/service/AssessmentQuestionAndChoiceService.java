package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.AssessmentQuestionRequest;
import org.springframework.web.multipart.MultipartFile;

public interface AssessmentQuestionAndChoiceService {
    void createQuestionAndChoices(AssessmentQuestionRequest questionRequest, MultipartFile file);

    void updateQuestionndChoices(AssessmentQuestionRequest questionRequest, MultipartFile file);

    void deleteAssessmentQuestionById(Integer id);
}
