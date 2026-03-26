package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.entity.EnrollmentCourseEntity;
import com.mxhieu.doantotnghiep.service.EnrollmentServece;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    // Service xử lý logic ghi danh khóa học cho học viên
    private final EnrollmentServece enrollmentServece;

    /**
     * API lấy danh sách khóa học mà học viên đã đăng kí sau khi làm bài test đầu vào
     * Dựa theo Student ID
     */
    @GetMapping("/student/{studenId}")
    public ApiResponse<?> getStudentEnrollments(@PathVariable Integer studenId) {

        // Gọi service để lấy danh sách khóa học đã đăng ký của học viên
        return ApiResponse.builder()
                .code(200)
                .data(enrollmentServece.getStudentEnrollmenteds(studenId))
                .build();
    }

    /**
     * API xem trước lộ trình học tập của học viên (Study Flow)
     * Dựa theo Student ID
     */
    @GetMapping("/studyFolow/{studentId}")
    public ApiResponse<?> getPreviewStudyFolow(@PathVariable Integer studentId) {

        // Gọi service để lấy thông tin lộ trình học tập
        return ApiResponse.builder()
                .code(200)
                .data(enrollmentServece.getPreviewStudyFlow(studentId))
                .build();
    }
}