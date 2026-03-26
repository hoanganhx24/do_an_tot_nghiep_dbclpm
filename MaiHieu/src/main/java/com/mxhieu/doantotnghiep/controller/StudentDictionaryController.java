package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.StudentDictionaryRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.StudentDictionaryResponse;
import com.mxhieu.doantotnghiep.service.StudentDictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("student-dictionarys")
@RequiredArgsConstructor
public class StudentDictionaryController {
    private final StudentDictionaryService studentDictionaryService;

    @PostMapping()
    public ApiResponse<?> saveStudentDictionary(@RequestBody StudentDictionaryRequest studentDictionaryRequest) {
        studentDictionaryService.save(studentDictionaryRequest);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .build();
    }

    @GetMapping("/student/{studentID}")
    public ApiResponse<?> getStudentDictionary(@PathVariable Integer studentID) {
        return ApiResponse.builder()
                .code(200)
                .data(studentDictionaryService.getAllForStudent(studentID))
                .build();
    }
}
