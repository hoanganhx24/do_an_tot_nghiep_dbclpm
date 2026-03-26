package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/modules")
@RequiredArgsConstructor
public class ModuleController {
    private final ModuleService moduleService;
    @PostMapping
    public ApiResponse<?> addModule(@RequestBody ModuleRequest request) {
        moduleService.addModule(request);
        return ApiResponse.builder()
                .code(200)
                .message("Module Created")
                .build();
    }
    @GetMapping
    public ApiResponse<?> getAllModules() {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(moduleService.getAll())
                .build();
    }
    @GetMapping("/course/{courseId}")
    public ApiResponse<?> getAllModulesOfCourse(@PathVariable int courseId) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(moduleService.getAllModulesOfCourse(courseId))
                .build();
    }
    @GetMapping("/maxOrder/{courseId}" )
    public ApiResponse<?> getMaxOrder(@PathVariable Integer courseId) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(moduleService.getMaxOrder(courseId))
                .build();
    }
    @PutMapping()
    public ApiResponse<?> updateModule(@RequestBody ModuleRequest request) {
        moduleService.updateModule(request);
        return ApiResponse.builder()
                .code(200)
                .message("Module Updated")
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteModule(@PathVariable Integer id) {
        moduleService.deleteModule(id);
        return ApiResponse.builder()
                .code(200)
                .message("Module Deleted")
                .build();
    }
}
