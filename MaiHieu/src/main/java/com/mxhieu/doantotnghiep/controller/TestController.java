package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.TestRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/tests")
@RequiredArgsConstructor
public class TestController {
    private final TestService testService;
    @PostMapping()
    public ApiResponse<?> createTest(@RequestBody TestRequest testRequest){
        testService.createTest(testRequest);
        return ApiResponse.builder().code(200).message("Create Test Success").build();
    }

    @GetMapping("/{id}")
    public ApiResponse<?> getTest(@PathVariable Integer id){
        return ApiResponse.builder()
                .code(200)
                .message("Get Test Success")
                .data(testService.getTestById(id))
                .build();

    }
    @PostMapping("/firstTest")
    public ApiResponse<?> createFirstTest(@RequestBody TestRequest testRequest){
        testService.createFirstTest(testRequest);
        return ApiResponse.builder().code(200).message("Create Test Success").build();
    }
    @GetMapping("/firstTests/summary")
    public ApiResponse<?> getFirstTestsSummery(){
        return ApiResponse.builder()
                .code(200)
                .data(testService.getFirstTestsSummery())
                .build();
    }
    @GetMapping("/miniTest/summary/{id}")
    public ApiResponse<?> getMiniTestsSummery(@PathVariable Integer id){
        return ApiResponse.builder()
                .code(200)
                .data(testService.getMiniTestsSummery(id))
                .build();
    }
    @GetMapping("/{testId}/student/{studentProfileId}/completedStar" )
    public ApiResponse<?> getCompletedStar(@PathVariable Integer testId, @PathVariable Integer studentProfileId) {
        int completedStar = testService.commpletedStar(testId, studentProfileId);
        float maxScore = testService.getMaxScore(testId, studentProfileId);
        Map<String, Object> response = new HashMap<>();
        response.put("completedStar", completedStar);
        response.put("maxScore", maxScore);
        return ApiResponse.builder()
                .code(200)
                .data(response)
                .build();
    }
    @GetMapping("/{testId}/student/{studentProfileId}/testAttempts")
    public ApiResponse<?> getTestAttempts(@PathVariable Integer testId, @PathVariable Integer studentProfileId) {
        return ApiResponse.builder()
                .code(200)
                .data(testService.getTestAttemptIds(testId, studentProfileId))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteTest(@PathVariable Integer id){
        testService.deleteTest(id);
        return ApiResponse.builder().code(200).message("Delete Test Success").build();
    }
}
