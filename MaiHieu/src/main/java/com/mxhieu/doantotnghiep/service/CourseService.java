package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CourseService {
    void addCourseToTrack(CourseRequest request, MultipartFile file);
    public List<CourseResponse> getAllCourses();

    CourseResponse getCourseById(Integer id);

    public List<CourseResponse> getCoursesByTeacherId(Integer teacherId);

    CourseResponse getCourseAndModuleByCourseIdForTeacher(CourseRequest courseRequest);

    void publishCourse(Integer id);

    String completedCups(Integer courseId, Integer studentProfileId);

    CourseResponse getCourseForStudent(CourseRequest courseRequest);

    boolean isCompleted(Integer courseId, Integer studentProfileId);
}
