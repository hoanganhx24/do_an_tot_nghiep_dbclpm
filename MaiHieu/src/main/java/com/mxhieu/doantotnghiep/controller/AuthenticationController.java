package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.AuthenticationRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.AuthenticationResponse;
import com.mxhieu.doantotnghiep.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    // Service xử lý logic xác thực người dùng
    AuthenticationService authenticationService;

    /**
     * API đăng nhập
     * Nhận thông tin đăng nhập (username, password) từ client
     * Trả về access token và refresh token nếu đăng nhập thành công
     */
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest authenticationRequest) {

        // Gọi service để xử lý đăng nhập
        AuthenticationResponse response = authenticationService.logIn(authenticationRequest);

        // Trả về response chứa thông tin xác thực
        return ApiResponse.<AuthenticationResponse>builder()
                .code(200)
                .message("Đăng nhập thành công")
                .data(response)
                .build();
    }

    /**
     * API làm mới access token
     * Nhận refresh token từ client
     * Trả về access token mới nếu refresh token hợp lệ
     */
    @PostMapping("/refresh-token")
    public ApiResponse<AuthenticationResponse> refreshToken(
            @RequestBody Map<String, String> body) {

        // Lấy refresh token từ request body
        String refreshToken = body.get("refreshToken");

        // Gọi service để tạo access token mới
        AuthenticationResponse response = authenticationService.refreshToken(refreshToken);

        // Trả về response thành công
        return ApiResponse.<AuthenticationResponse>builder()
                .code(200)
                .message("Làm mới token thành công")
                .data(response)
                .build();
    }
}