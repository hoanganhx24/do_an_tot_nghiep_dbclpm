package com.mxhieu.doantotnghiep.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor // Lombok tự sinh constructor cho các biến final
public class CourseController {

    // Service xử lý logic nghiệp vụ liên quan đến Course
    private final CourseService courseService;

    /**
     * API tạo mới Course
     * Nhận dữ liệu dạng multipart/form-data gồm:
     *  - course: chuỗi JSON chứa thông tin khóa học
     *  - image: file hình ảnh đại diện cho khóa học
     */
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<?> createCourse(
            @RequestPart("course") String courseJson,   // Chuỗi JSON mô tả Course
            @RequestPart("image") MultipartFile imageFile) {

        try {
            // ObjectMapper dùng để chuyển đổi JSON string sang object Java
            ObjectMapper mapper = new ObjectMapper();

            // Parse JSON course sang CourseRequest
            CourseRequest courseRequest = mapper.readValue(courseJson, CourseRequest.class);

            // Gọi service để tạo khóa học và gắn vào track
            courseService.addCourseToTrack(courseRequest, imageFile);

            // Trả về response thành công
            return ApiResponse.builder()
                    .code(200)
                    .message("Course Created")
                    .build();

        } catch (Exception e) {
            // Bắt lỗi trong quá trình parse JSON hoặc xử lý dữ liệu
            e.printStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    /**
     * API publish (công khai) khóa học
     * Chuyển trạng thái khóa học sang Published
     */
    @PutMapping("/publish/{id}")
    public ApiResponse<?> publishCourse(@PathVariable Integer id) {

        // Gọi service để publish khóa học
        courseService.publishCourse(id);

        return ApiResponse.builder()
                .code(200)
                .message("Course Published")
                .build();
    }

    /**
     * API lấy danh sách tất cả khóa học
     */
    @GetMapping
    public ApiResponse<?> getAllCourses() {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(courseService.getAllCourses())
                .build();
    }

    /**
     * API lấy chi tiết khóa học theo ID
     */
    @GetMapping("/{id}")
    public ApiResponse<?> getCourseById(@PathVariable Integer id) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(courseService.getCourseById(id))
                .build();
    }

    /**
     * API lấy chi tiết khóa học theo Course ID và Student ID
     * lấy chi tiết danh sách module và từng lesson của module
     * Dùng cho phía học viên (student)
     */
    @GetMapping("{courseId}/student/{studentId}")
    public ApiResponse<?> getCourseByIdByStudent(
            @PathVariable Integer courseId,
            @PathVariable Integer studentId) {

        // Tạo CourseRequest chứa thông tin course và student
        CourseRequest courseRequest = CourseRequest.builder()
                .id(courseId)
                .studentProfileId(studentId)
                .build();

        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(courseService.getCourseForStudent(courseRequest))
                .build();
    }

    /**
     * API lấy chi tiết khóa học dành cho giáo viên
     * Có thể truyền thêm version để lấy phiên bản cụ thể của khóa học
     */
    @GetMapping("/teacher")
    public ApiResponse<?> getCourseByIdByTeacher(
            @RequestParam Integer courseId,
            @RequestParam(required = false) Integer version) {

        // Tạo CourseRequest chứa thông tin course và version
        CourseRequest courseRequest = CourseRequest.builder()
                .id(courseId)
                .version(version)
                .build();

        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(courseService.getCourseAndModuleByCourseIdForTeacher(courseRequest))
                .build();
    }

    /**
     * API lấy danh sách khóa học theo Teacher ID
     */
    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<?> getCoursesByTeacherId(@PathVariable Integer teacherId) {
        return ApiResponse.builder()
                .code(200)
                .message("Success")
                .data(courseService.getCoursesByTeacherId(teacherId))
                .build();
    }
}