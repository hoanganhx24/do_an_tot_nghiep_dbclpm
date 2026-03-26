package com.mxhieu.doantotnghiep.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.AssessmentQuestionRequest;
import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.AssessmentOptionService;
import com.mxhieu.doantotnghiep.service.AssessmentQuestionAndChoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("assessmentquesstions")
@RequiredArgsConstructor // Lombok tự động sinh constructor cho các biến final
public class AssessmentQuestionAndChoiceController {

    // Service xử lý logic tạo / cập nhật câu hỏi và đáp án
    private final AssessmentQuestionAndChoiceService assessmentQuestionAndChoiceService;

    // Service xử lý các option (đáp án) của câu hỏi
    private final AssessmentOptionService assessmentOptionService;

    /**
     * API tạo mới câu hỏi Assessment kèm các lựa chọn (choices)
     * Dữ liệu truyền lên theo dạng multipart/form-data gồm:
     *  - requests: object AssessmentQuestionRequest
     *  - file: file đính kèm (hình ảnh / audio / media) (không bắt buộc)
     */
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<?> createQuestions(
            @RequestPart("requests") AssessmentQuestionRequest questionRequest,
            @RequestPart(required = false) MultipartFile file
    ) {

        // Gọi service để tạo câu hỏi và các lựa chọn
        assessmentQuestionAndChoiceService.createQuestionAndChoices(questionRequest, file);

        // Trả về response thành công
        return ApiResponse.builder()
                .code(200)
                .message("Created successfully")
                .build();
    }

    /**
     * API cập nhật câu hỏi Assessment và các lựa chọn
     * Dữ liệu truyền lên tương tự API tạo mới
     */
    @PutMapping(consumes = "multipart/form-data")
    public ApiResponse<?> updateQuestions(
            @RequestPart("requests") AssessmentQuestionRequest questionRequest,
            @RequestPart(required = false) MultipartFile file
    ) {

        // Gọi service để cập nhật câu hỏi và các lựa chọn
        assessmentQuestionAndChoiceService.updateQuestionndChoices(questionRequest, file);

        // Trả về response thành công
        return ApiResponse.builder()
                .code(200)
                .message("Update successfully")
                .build();
    }

    /**
     * API xóa câu hỏi Assessment theo ID
     */
    @DeleteMapping("/{id}")
    ApiResponse<?> deleteAssessmentQuestion(@PathVariable Integer id) {

        // Gọi service để xóa câu hỏi
        assessmentQuestionAndChoiceService.deleteAssessmentQuestionById(id);

        return ApiResponse.builder()
                .code(200)
                .message("Deleted")
                .build();
    }
}
