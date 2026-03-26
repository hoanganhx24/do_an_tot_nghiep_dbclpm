package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/lesson-progress")
@RequiredArgsConstructor
public class LessonProgressController {
    private final LessonProgressService lessonProgressService;
    @PostMapping()
    public ApiResponse<?> checkCompletionCondition(@RequestBody LessonProgressRequest lessonProgressRequest) {
        lessonProgressService.checkCompletionCondition(lessonProgressRequest);
        return ApiResponse.builder()
                .code(200)
                .message("Check completion condition success")
                .build();
    }
}
