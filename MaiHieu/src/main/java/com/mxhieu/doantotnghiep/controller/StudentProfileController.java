package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/studentprofiles")
@RequiredArgsConstructor
public class StudentProfileController {
    private final StudentProfileService studentProfileService;
    @PostMapping("/create")
    public ApiResponse<?> createStudentProfile(@RequestBody StudentprofileRequest request) {

        studentProfileService.createStudentProfile(request);
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .build();
    }
    @GetMapping()
    public ApiResponse<?> getStudentProfiles() {
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .data(studentProfileService.getStudentProfiles())
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<?> getStudentProfileById(@PathVariable int id) {
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .data(studentProfileService.getStudentProfileById(id))
                .build();
    }
    @PutMapping()
    public ApiResponse<?> updateStudentProfile(@RequestBody StudentprofileRequest request) {
        studentProfileService.updateStudentProfile(request);
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .build();
    }
    @PutMapping("/khoaTaiKhoan/{id} ")
    public ApiResponse<?> khoaTaiKhoanStudentProfile(@PathVariable int id) {
        studentProfileService.khoaTaiKhoanStudentProfile(id);
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .build();
    }
}
