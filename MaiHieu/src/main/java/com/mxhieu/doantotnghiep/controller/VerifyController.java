package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/verify")
@RequiredArgsConstructor
public class VerifyController {
    private final VerificationService verificationService;

    @PostMapping("/otp")
    public ApiResponse<?> verifyOtp(@RequestBody Map<String, String> request) {
        if(!request.containsKey("email") || !request.containsKey("otp")) {
            throw new AppException(ErrorCode.MISSING_PARAMETERS);
        }
        boolean verified = verificationService.verifyCode(request.get("email"), request.get("otp"));
        if (!verified) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }
        return ApiResponse.builder()
                .code(200)
                .message("Xác thực OTP thành công")
                .build();
    }
}
