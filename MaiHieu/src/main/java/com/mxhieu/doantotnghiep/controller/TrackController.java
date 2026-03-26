package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tracks")
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    /**
     * GET /tracks
     * Lấy danh sách tất cả Track (type = MAIN)
     *
     * @return danh sách track ở dạng ApiResponse
     */
    @GetMapping()
    public ApiResponse<Object> findAll() {
        return ApiResponse
                .builder()
                .code(200)
                .message("Success")
                .data(trackService.findAll("MAIN"))
                .build();
    }

    /**
     * GET /tracks/courses
     * ADMIN lấy danh sách Track và các khóa học của từng Track
     *
     * @param type loại track (MAIN / SUPPORT / ALL)
     * @return danh sách track kèm courses cho admin
     */
    @GetMapping("/courses")
    public ApiResponse<Object> getCoursesOfTrackByAdmin(@RequestParam String type) {
        return ApiResponse
                .builder()
                .code(200)
                .message("Success")
                .data(trackService.findAllByAdmin(type))
                .build();
    }

    /**
     * GET /tracks/courses/teacher
     * Teacher lấy danh sách Track và courses dựa theo teacherId
     *
     * @param type loại track
     * @param teacherId id của giáo viên
     * @return danh sách track + courses thuộc teacher
     */
    @GetMapping("/courses/teacher")
    public ApiResponse<Object> getCoursesOfTrackByTeacher(
            @RequestParam String type,
            @RequestParam Integer teacherId
    ) {
        return ApiResponse
                .builder()
                .code(200)
                .message("Success")
                .data(trackService.findAllByTeacher(type, teacherId))
                .build();
    }

    /**
     * GET /tracks/{code}/courses-main
     * Lấy danh sách course chính (Main) của 1 Track dựa theo track code
     *
     * @param code mã của track (ví dụ: FE01, BE02)
     * @return danh sách khóa học chính
     */
    @GetMapping("{code}/courses-main")
    public ApiResponse<Object> getCoursesMainByTrackId(@PathVariable String code) {
        return ApiResponse
                .builder()
                .code(200)
                .message("Success")
                .data(trackService.getCoursesByTrackCode(code, "Main"))
                .build();
    }

    /**
     * GET /tracks/{code}/courses-support
     * Lấy danh sách khóa học phụ (Support) của 1 Track
     *
     * @param code mã của track
     * @return danh sách khóa học phụ
     */
    @GetMapping("{code}/courses-support")
    public ApiResponse<Object> getCoursesSupportByTrackId(@PathVariable String code) {
        return ApiResponse
                .builder()
                .code(200)
                .message("Success")
                .data(trackService.getCoursesByTrackCode(code, "Support"))
                .build();
    }

}
