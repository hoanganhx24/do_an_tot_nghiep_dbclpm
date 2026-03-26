package com.mxhieu.doantotnghiep.service;


import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface QuestionService {
    void createQuestionAndChoices(QuestionRequest questionRequests, MultipartFile files);

    void deleteQuestionAndChoies(int id);

    void updateQuestionndChoices(QuestionRequest questionRequest, MultipartFile file);
}
