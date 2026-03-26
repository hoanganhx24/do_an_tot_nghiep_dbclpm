package com.mxhieu.doantotnghiep.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.ExerciseAndQuestionRequest;
import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.request.ExerciseTypeRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.repository.ExerciseRepository;
import com.mxhieu.doantotnghiep.service.ExerciseService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private  final ExerciseService exerciseService;
    private final ObjectMapper objectMapper;


    /**
     * API tạo mới một Exercise ở trang giáo viên;
     *
     * Endpoint nhận dữ liệu dạng multipart/form-data, trong đó:
     *  - exerciseRequest (bắt buộc): chuỗi JSON chứa thông tin ExerciseRequest
     *  - mediaData (không bắt buộc): file media (audio/video)
     *  - imgData   (không bắt buộc): file ảnh minh họa
     *  - paragraphs (không bắt buộc): danh sách các đoạn văn (List<String>)
     *
     * Các phần tử không bắt buộc có thể null khi client không truyền lên.
     * Hàm sẽ parse JSON bằng ObjectMapper và gán dữ liệu file vào đối tượng ExerciseRequest.
     *
     * @param exerciseRequest JSON string của ExerciseRequest (bắt buộc)
     * @param mediaData file media (tùy chọn)
     * @param imgData file ảnh (tùy chọn)
     * @param paragraphs danh sách đoạn văn (tùy chọn)
     * @return ApiResponse thông báo tạo thành công
     */
    @PostMapping(consumes = "multipart/form-data")
    ApiResponse<?> createExercise(@RequestPart String request,
                                  @RequestPart(required = false) MultipartFile mediaData,
                                  @RequestPart(required = false) MultipartFile imgData){
        ObjectMapper mapper = new ObjectMapper();
        ExerciseRequest exerciseRequest = null;
        try{
            exerciseRequest = objectMapper.readValue(request, ExerciseRequest.class);
            if(mediaData != null) exerciseRequest.setMediaData(mediaData.getBytes());
            if(imgData != null) exerciseRequest.setImageData(imgData.getBytes());
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        exerciseService.createExercise(exerciseRequest);
        ApiResponse<ExerciseResponse> response = ApiResponse.<ExerciseResponse>builder()
                .code(200)
                .message("Exercise Created")
                .build();
        return response;
    }

    @PutMapping(consumes = "multipart/form-data")
    ApiResponse<?> updateExercise(@RequestPart String request,
                                  @RequestPart(required = false) MultipartFile mediaData,
                                  @RequestPart(required = false) MultipartFile imgData){
        ObjectMapper mapper = new ObjectMapper();
        ExerciseRequest exerciseRequest = null;
        try{
            exerciseRequest = objectMapper.readValue(request, ExerciseRequest.class);
            if(mediaData != null) exerciseRequest.setMediaData(mediaData.getBytes());
            if(imgData != null) exerciseRequest.setImageData(imgData.getBytes());
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        exerciseService.updateExercise(exerciseRequest);
        ApiResponse<ExerciseResponse> response = ApiResponse.<ExerciseResponse>builder()
                .code(200)
                .message("Exercise Created")
                .build();
        return response;
    }
    @GetMapping("/orderIndext/{lessonId}")
    ApiResponse<?> getOrderIndex(@PathVariable Integer lessonId){
        return ApiResponse.builder()
                .code(200)
                .data(exerciseService.getMaxOrder(lessonId))
                .build();
    }
    @DeleteMapping("/{id}")
    ApiResponse<?> deleteExercise(@PathVariable Integer id){
        exerciseService.deleteExcercise(id);
        return ApiResponse.builder()
                .code(200)
                .message("delete thanh cong")
                .build();
    }


//    @PostMapping(consumes = "multipart/form-data")
//    ApiResponse<?> createExerciseAndQuestions(@RequestPart String exerciseRequest,
//                                              @RequestPart(required = false) MultipartFile mediaFiles) {
//
//        ObjectMapper mapper = new ObjectMapper();
//        ExerciseAndQuestionRequest request = null;
//        try {
//            request = mapper.readValue(exerciseRequest, ExerciseAndQuestionRequest.class);
//            request.setMediaData(mediaFiles.getBytes());
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException(e);
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        exerciseService.createExerciseAndQuestion(request);
//        return ApiResponse.builder()
//                .code(200)
//                .message("Success")
//                .build();
//    }
    @GetMapping("/lesson/{lessonId}/student/{studentProfileId}")
    ApiResponse<?> getExerciseIByLessonIdByStudentId(@PathVariable Integer lessonId, @PathVariable Integer studentProfileId) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(exerciseService.getExerciseDetailsByLessonIdForStudent(lessonId, studentProfileId))
                .build();
    }
    @GetMapping("/interactive/{lessonId}/student/{studentProfileId}")
    ApiResponse<?> getInteractiveExerciseByLessonIdByStudentId(@PathVariable Integer lessonId, @PathVariable Integer studentProfileId) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(exerciseService.getInteractiveExerciseByLessonIdForStudent(lessonId, studentProfileId))
                .build();
    }
    @GetMapping("/student")
    ApiResponse<?> getExerciseByIdForStudent(@RequestParam Integer id,
                                             @RequestParam Integer studentProfileId) {
        ExerciseResponse exerciseResponse = exerciseService.getExerciseDetailById(id, studentProfileId);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(exerciseResponse)
                .build();
    }
    @GetMapping("/lesson/{lessonId}/summary")
    ApiResponse<?> getSummaryByLessonId(@PathVariable Integer lessonId) {
        return ApiResponse.builder()
            .code(200)
            .data(exerciseService.getSummaryExercisesByLessonId(lessonId))
            .build();
    }
    // lấy bài tập cho trang giáo viên và admin
    @GetMapping("/{id}")
    ApiResponse<?> getExerciseByIdForTeacher(@PathVariable Integer id) {
        ExerciseResponse exerciseResponse = exerciseService.getExerciseDetailById(id);
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(exerciseResponse)
                .build();
    }
}
