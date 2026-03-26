package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.UserRespone;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.service.UserService;
import com.mxhieu.doantotnghiep.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final VerificationService verificationService;

//    @GetMapping("/myInfor")
//    public ApiResponse<UserRespone> getMyInfor() {
//        UserRespone userRespone = userService.getMyInfor();
//        ApiResponse<UserRespone> response = new ApiResponse<>();
//        response.setCode(200);
//        response.setMessage("Success");
//        response.setData(userRespone);
//        return response;
//    }

    /**
     * 1️⃣ Gửi OTP nếu email chưa tồn tại
     */
    @PostMapping("/check-email")
    public ApiResponse checkEmail(@RequestBody UserRequest user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            ApiResponse response = new ApiResponse();
            response.setCode(400);
            response.setMessage("Email không được để trống");
            return response;
        }
        userService.checkEmailExistsAndSendCode(user);
        ApiResponse response = new ApiResponse();
        response.setCode(200);
        response.setMessage("Success");
        return  response;
    }
//
//    /**
//     * 2️⃣ Xác thực mã OTP và tạo tài khoản
//     */
//    @PostMapping("/verify")
//    public ApiResponse verifyAndCreate(@RequestBody UserRequest user,
//                                       @RequestParam String otp) {
//        userService.createUser(user, otp);
//        ApiResponse response = new ApiResponse();
//        response.setCode(200);
//        response.setMessage("Tài khoản đã được tạo thành công!");
//        return response;
//    }
@GetMapping("/{email}")
public ApiResponse getUser(@PathVariable String email) {
    return ApiResponse.builder()
            .code(200)
            .data(userService.getUserByEmail(email))
            .build();
}

    @PutMapping()
    public ApiResponse updateUser(@RequestBody UserRequest user) {
        userService.updateInformation(user);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }

    @GetMapping("/forgotPassword/{email}")
    public ApiResponse<?> forGotPass(@PathVariable String email) {
        userService.forGotPassword(email);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }

    @PutMapping("/password")
    public  ApiResponse updatePassword(@RequestBody UserRequest user) {
        userService.changePassword(user);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }

}