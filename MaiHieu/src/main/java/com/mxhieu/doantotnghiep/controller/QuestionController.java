package com.mxhieu.doantotnghiep.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.patterns.TypePatternQuestions;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<?> createQuestions(
            @RequestPart("requests") QuestionRequest questionRequest,
            @RequestPart(required = false) MultipartFile file
    ) {
        questionService.createQuestionAndChoices(questionRequest, file);
        return ApiResponse.builder()
                .code(200)
                .message("Created successfully")
                .build();
    }
    @PutMapping(consumes = "multipart/form-data")
    public ApiResponse<?> updateQuestions(@RequestPart("requests") QuestionRequest questionRequest,
                                          @RequestPart(required = false) MultipartFile file
    ){
        questionService.updateQuestionndChoices(questionRequest,file);
        return ApiResponse.builder()
                .code(200)
                .message("update successfully")
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestionAndChoies(id);
        return ApiResponse.builder()
                .code(200)
                .message("Deleted successfully")
                .build();
    }
}
