package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.TestProgressRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.TestProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/testprogress")
@RequiredArgsConstructor
public class TestProgressController {
    private final TestProgressService testProgressService;
    @PostMapping()
    public ApiResponse<?> checkCompletionCondition(@RequestBody TestProgressRequest request){
        testProgressService.checkCompletionCondition(request);
        return ApiResponse.builder()
                .code(200)
                .message("Check completion condition success")
                .build();
    }
}
