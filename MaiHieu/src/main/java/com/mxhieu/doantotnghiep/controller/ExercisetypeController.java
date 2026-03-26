package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.ExerciseTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("exercisetypes")
@RequiredArgsConstructor
public class ExercisetypeController {
    private final ExerciseTypeService exerciseTypeService;
    @GetMapping()
    ApiResponse<?> getExercisetype() {
        return new ApiResponse<>().builder()
                .code(200)
                .data(exerciseTypeService.getExerciseTypes())
                .build();
    }
}
