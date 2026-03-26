package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.service.TeacherprofileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacherprofiles")
@RequiredArgsConstructor
public class TeacherprofileController {

    private final TeacherprofileService teacherprofileService;
    @PostMapping("/checkEmail")
    public ApiResponse checkEmail(@RequestBody String email) {
        teacherprofileService.checkEmailExists(email);
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .build();
    }

    @PostMapping("/create")
    public ApiResponse createTeacherProfile(@RequestBody TeacherprofileRequest request) {
        teacherprofileService.createTeacherProfile(request);
        return ApiResponse.builder()
                .code(200)
                .message("success")
                .build();
    }
    @GetMapping()
    public ApiResponse<List<TeacherprofileResponse>> getAllTeacherProfiles() {
        return ApiResponse.<List<TeacherprofileResponse>>builder()
                .code(200)
                .message("success")
                .data(teacherprofileService.getAllTeacherProfiles())
                .build();
    }
    @GetMapping("/active")
    public ApiResponse<List<TeacherprofileResponse>> getAllTeacherProfilesActive() {
        return ApiResponse.<List<TeacherprofileResponse>>builder()
                .code(200)
                .message("success")
                .data(teacherprofileService.getAllTeacherProfilesActive())
                .build();
    }
    @GetMapping("/Teacherprofile/{id}")
    public ApiResponse<TeacherprofileResponse> getTeacherprofile(@PathVariable Integer id) {

        return ApiResponse.<TeacherprofileResponse>builder()
                .code(200)
                .message("Success")
                .data(teacherprofileService.getTeacherProfileByID(id))
                .build();
    }
    @PutMapping("/{id}/terminate")
    public ApiResponse terminateTeacherProfile(@RequestHeader("Authorization") String authorizationHeader,
                                               @PathVariable Integer id) {
        teacherprofileService.terminateTeacherProfile(id);
        return ApiResponse.builder()
                .code(200)
                .message("Teacher profile terminated successfully")
                .build();
    }
    @PutMapping()
    public ApiResponse<?> updateTeacher(@RequestBody TeacherprofileRequest request) {
        teacherprofileService.updateTeacher(request);
        return ApiResponse.builder()
                .code(200)
                .message("Teacher profile updated successfully")
                .build();
    }
}
