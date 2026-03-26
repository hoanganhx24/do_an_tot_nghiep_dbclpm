package com.mxhieu.doantotnghiep.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.AssessmentRequest;
import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.A;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("assessments") // Định nghĩa base URL cho các API liên quan đến Assessment
@RequiredArgsConstructor // Tự động sinh constructor cho các biến final
public class AssessmentController {

    // Service xử lý logic nghiệp vụ cho Assessment
    private final AssessmentService assessmentService;

    /**
     * API tạo mới Assessment
     * Nhận dữ liệu dạng multipart/form-data gồm:
     *  - request: chuỗi JSON chứa thông tin assessment
     *  - mediaData: file media (video/audio) (không bắt buộc)
     *  - imgData: file hình ảnh (không bắt buộc)
     */
    @PostMapping(consumes = "multipart/form-data")
    ApiResponse<?> createAssessment(
            @RequestPart String request,
            @RequestPart(required = false) MultipartFile mediaData,
            @RequestPart(required = false) MultipartFile imgData) {

        // ObjectMapper dùng để chuyển đổi JSON string sang object Java
        ObjectMapper mapper = new ObjectMapper();
        AssessmentRequest assessmentRequest = null;

        try {
            // Chuyển JSON request sang đối tượng AssessmentRequest
            assessmentRequest = mapper.readValue(request, AssessmentRequest.class);

            // Nếu có file media thì chuyển sang byte[] và gán vào DTO
            if (mediaData != null)
                assessmentRequest.setMediaData(mediaData.getBytes());

            // Nếu có file hình ảnh thì chuyển sang byte[] và gán vào DTO
            if (imgData != null)
                assessmentRequest.setImageData(imgData.getBytes());

        } catch (IOException e) {
            // Lỗi khi parse JSON hoặc đọc file
            throw new RuntimeException(e);
        }

        // Gọi service để tạo mới assessment
        assessmentService.createAssessment(assessmentRequest);

        // Trả về response thành công
        return ApiResponse.builder()
                .code(200)
                .message("Assessment Created")
                .build();
    }

    /**
     * API cập nhật Assessment
     * Cách truyền dữ liệu tương tự API tạo mới
     */
    @PutMapping(consumes = "multipart/form-data")
    ApiResponse<?> updateAssessment(
            @RequestPart String request,
            @RequestPart(required = false) MultipartFile mediaData,
            @RequestPart(required = false) MultipartFile imgData) {

        ObjectMapper mapper = new ObjectMapper();
        AssessmentRequest assessmentRequest = null;

        try {
            // Parse JSON request
            assessmentRequest = mapper.readValue(request, AssessmentRequest.class);

            // Gán file media nếu có
            if (mediaData != null)
                assessmentRequest.setMediaData(mediaData.getBytes());

            // Gán file hình ảnh nếu có
            if (imgData != null)
                assessmentRequest.setImageData(imgData.getBytes());

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Gọi service để cập nhật assessment
        assessmentService.updateAssessment(assessmentRequest);

        return ApiResponse.builder()
                .code(200)
                .message("Assessment Updated")
                .build();
    }

    /**
     * API lấy danh sách tóm tắt Assessment theo Test ID cho admin và teacher
     */
    @GetMapping("/test/{testID}/summary")
    ApiResponse<List<AssessmentResponse>> getSummaryAssessmentsByTestId(@PathVariable Integer testID) {
        return ApiResponse.<List<AssessmentResponse>>builder()
                .code(200)
                .data(assessmentService.getSummaryAssessmentsByTestId(testID))
                .build();
    }

    /**
     * API lấy chi tiết Assessment theo ID
     */
    @GetMapping("/{id}")
    ApiResponse<AssessmentResponse> getAssessmentDetailById(@PathVariable Integer id) {
        return ApiResponse.<AssessmentResponse>builder()
                .code(200)
                .data(assessmentService.getAssessmentDetailById(id))
                .build();
    }

    /**
     * API xóa Assessment theo ID
     */
    @DeleteMapping("/{id}")
    ApiResponse<?> deleteAssessment(@PathVariable Integer id) {
        assessmentService.deleteAssessmentById(id);
        return ApiResponse.builder()
                .code(200)
                .message("Assessment Deleted")
                .build();
    }

    /**
     * API lấy Assessment cho bài test đầu tiên
     * khi học sinh mới đăng nhập lần đầu sẽ làm bài test đầu vào
     */
    @GetMapping("/firsttest")
    ApiResponse<List<AssessmentResponse>> getAssessmentDetailForFistTest() {
        return ApiResponse.<List<AssessmentResponse>>builder()
                .code(200)
                .data(assessmentService.getAssessmentDetailForFistTest())
                .build();
    }

    /**
     * API lấy danh sách Assessment theo Test ID (Mini Test)
     */
    @GetMapping("/mini-test/{id}")
    ApiResponse<List<AssessmentResponse>>getAssessmentDetailByTestId(@PathVariable Integer id) {
        return ApiResponse.<List<AssessmentResponse>>builder()
                .code(200)
                .data(assessmentService.getAssessmentsDetailByTestId(id))
                .build();
    }
}
