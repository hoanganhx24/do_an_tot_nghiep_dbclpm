package com.mxhieu.doantotnghiep.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonOrTestAroundResponse;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
public class LessonController {
    private final LessonService lessonService;
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<?> createLesson(
            @RequestPart("lesson") String lessonJson,
            @RequestPart("videoPath") String videoPath,
            @RequestPart("materials") List<MultipartFile> materials
    ) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        LessonRequest lessonRequest = objectMapper.readValue(lessonJson, LessonRequest.class);

        lessonService.createLesson(lessonRequest, videoPath, materials);

        return ApiResponse.builder()
                .code(200)
                .message("create lesson success")
                .build();
    }
    @GetMapping("/max-order/{moduleId}")
    public ApiResponse<?> getMaxOrder(@PathVariable Integer moduleId) {
        Integer maxOrder = lessonService.getMaxOrder(moduleId);
        return new ApiResponse<Integer>().builder()
                .code(200)
                .message("Get max order success")
                .data(maxOrder)
                .build();
    }
    @GetMapping()
    public ApiResponse<?> getLessons(@RequestParam Integer moduleId) {
        List<LessonResponse> lessonResponses = lessonService.getLessons(moduleId);
        return new ApiResponse<List<LessonResponse>>().builder()
                .code(200)
                .message("Get lessons success")
                .data(lessonResponses)
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<?> getLesson(@PathVariable Integer id) {
        LessonResponse result = lessonService.getLesson(id);
        return new ApiResponse<List<LessonResponse>>().builder()
                .code(200)
                .message("Get lesson success")
                .data(result)
                .build();
    }

    @GetMapping("/{id}/student/{studentId}")
    public ApiResponse<?> getLessonForStudent(@PathVariable Integer id, @PathVariable Integer studentId) {
        LessonResponse result = lessonService.getLessonForStudent(id, studentId);
        return new ApiResponse<List<LessonResponse>>().builder()
                .code(200)
                .message("Get lesson success")
                .data(result)
                .build();
    }
    @GetMapping("path/{lessonId}")
    public ApiResponse<?> getLessonPath(@PathVariable Integer lessonId) {
        String result = lessonService.getLessonPath(lessonId);
        return new ApiResponse<String>().builder()
                .code(200)
                .message("Get lesson path success")
                .data(result)
                .build();
    }
    @GetMapping("/next-lessonID")
    public ApiResponse<?> getNextLessonID(@RequestParam Integer id, @RequestParam String type ) {
        LessonOrTestAroundRequest request = new LessonOrTestAroundRequest(id, type);
        LessonOrTestAroundResponse result = lessonService.getNextLessonOrTest(request);
        return new ApiResponse<Integer>().builder()
                .code(200)
                .message("Get next lesson ID success")
                .data(result)
                .build();
    }
    @GetMapping("/previous-lessonID")
    public ApiResponse<?> getPreviousLessonID(@RequestParam Integer id, @RequestParam String type ) {
        LessonOrTestAroundRequest request = new LessonOrTestAroundRequest(id, type);
        LessonOrTestAroundResponse result = lessonService.getPreviousLessonID(request);
        return new ApiResponse<Integer>().builder()
                .code(200)
                .message("Get previous lesson ID success")
                .data(result)
                .build();
    }

    @PutMapping()
    public  ApiResponse<?> updateLesson(@RequestPart(value = "lesson") String lessonJson,
                                        @RequestPart(value = "videoPath", required = false ) String videoPath,
                                        @RequestPart(value = "materials", required = false) List<MultipartFile> materials) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        LessonRequest lessonRequest = objectMapper.readValue(lessonJson, LessonRequest.class);
        lessonRequest.setVideoPath(videoPath);
        lessonRequest.setMaterials(materials);
        lessonService.updateLesson(lessonRequest);
        return ApiResponse.builder()
                .code(200)
                .message("update lesson success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteLesson(@PathVariable Integer id) {
        lessonService.deleteLesson(id);
        return ApiResponse.builder()
                .code(200)
                .message("delete lesson success")
                .build();
    }
}
