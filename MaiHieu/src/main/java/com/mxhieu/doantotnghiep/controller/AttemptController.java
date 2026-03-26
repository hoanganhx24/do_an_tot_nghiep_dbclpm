package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.request.AttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.AttemptSevice;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attempts")
@RequiredArgsConstructor
public class AttemptController {

    // Service xử lý logic lưu attempt (kết quả làm bài)
    private final AttemptSevice attemptSevice;

    /**
     * API lưu hoặc cập nhật Attempt
     * Nhận dữ liệu dạng JSON trong body request
     * Thường được gọi khi người dùng hoàn thành hoặc đang làm bài test
     */
    @PutMapping
    public ApiResponse<?> saveAttempt(@RequestBody AttemptRequest attemptRequest) {

        // Gọi service để lưu thông tin attempt
        attemptSevice.saveAttempt(attemptRequest);

        // Trả về response thành công
        return ApiResponse.builder()
                .code(200)
                .message("Save attempt success")
                .build();
    }
}