package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.StudyPlanRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.StudyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("study-plans")
@RequiredArgsConstructor
public class StudyPlanController {
    private final StudyPlanService studyPlanService;
    @GetMapping("/overview/student/{studentId}")
    public ApiResponse<?> getStudyPlanOverview(@PathVariable Integer studentId) {
        return ApiResponse.builder()
                .code(200)
                .data(studyPlanService.getOverviewData(studentId))
                .message("Study Plan Overview Retrieved")
                .build();
    }
    @PostMapping()
    public ApiResponse<?> createStudyPlan(@RequestBody StudyPlanRequest studyPlanRequest) {
        studyPlanService.createStudyPlan(studyPlanRequest);
        return ApiResponse.builder()
                .code(200)
                .message("Create Study Plan - To be implemented")
                .build();
    }
    @GetMapping("/min-day-for-study/{trackId}/student/{studentId}")
    public ApiResponse<?> getMinDayForStudy(@PathVariable Integer trackId, @PathVariable Integer studentId) {
        return ApiResponse.builder()
                .code(200)
                .data(studyPlanService.soNgayHocToiThieu(trackId, studentId))
                .build();
    }

    @GetMapping("/{studyPlanId}")
    public ApiResponse<?> getStudyPlanDetail(@PathVariable Integer studyPlanId) {
        return ApiResponse.builder()
                .code(200)
                .data(studyPlanService.getStudyPlanDetail(studyPlanId))
                .build();
    }
    @PostMapping("/verify-information")
    public ApiResponse<?> verifyInformation(@RequestBody StudyPlanRequest studyPlanRequest) {
        return ApiResponse.builder()
                .code(200)
                .data(studyPlanService.verifyInformation(studyPlanRequest))
                .build();
    }
    @GetMapping("/checkExist")
    private ApiResponse<?> checkExist(@RequestParam Integer studentId) {
        return ApiResponse.builder()
                .code(200)
                .message("Study Plan Check Exist")
                .data(studyPlanService.checkExistStudyPlan(studentId))
                .build();
    }

    @GetMapping("/{studyPlanId}/information-about-studyplan")
    private ApiResponse<?> getInformationAboutStudyplan(@PathVariable Integer studyPlanId) {
        return ApiResponse.builder()
                .code(200)
                .data(studyPlanService.getInformation(studyPlanId))
                .build();
    }

}
