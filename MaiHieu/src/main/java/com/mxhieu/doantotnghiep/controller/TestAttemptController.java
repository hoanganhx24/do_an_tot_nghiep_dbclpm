package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.TestAttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.repository.TestAttemptRepository;
import com.mxhieu.doantotnghiep.service.TestAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/testattempt")
@RequiredArgsConstructor
public class TestAttemptController {
    private final TestAttemptService testAttemptService;
    @PostMapping()
    public ApiResponse<?> saveResultFirstTest(@RequestBody TestAttemptRequest testAttemptRequest){
        testAttemptService.saveResultFirstTest(testAttemptRequest);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }
    @PostMapping("/mini-test")
    public ApiResponse<?> saveResultMiniTest(@RequestBody TestAttemptRequest testAttemptRequest){
        testAttemptService.saveResultMiniTest(testAttemptRequest);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }
    @GetMapping("/{id}/testAttemptDetail")
    public ApiResponse<?> getTestAttemptDetailById(@PathVariable Integer id) {
        return ApiResponse.builder()
                .code(200)
                .data(testAttemptService.getTestAttemptDetailById(id))
                .build();
    }
}
