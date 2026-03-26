package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.request.TrackRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.EnrollmentEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;
import com.mxhieu.doantotnghiep.service.CourseService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TrackConverter extends BaseConverter<TrackEntity, TrackRequest, TrackResponse> {
    @Autowired
    ModelMapper modelMapper;
    @Autowired
    CourseConverter courseConverter;
    @Autowired
    CourseService courseService;

    public TrackResponse toTrackResponseWithCourses(TrackEntity trackEntity,String type) {
        TrackResponse trackResponse = modelMapper.map(trackEntity, TrackResponse.class);
        List <CourseEntity> courses = trackEntity.getCourses();
        if(type.equals("Main")){
            courses = courses.stream().filter(course -> course.getType().equals("Main")).toList();
        } else if (type.equals("Support")) {
            courses = courses.stream().filter(course -> course.getType().equals("Support")).toList();
        }
        trackResponse.setCourses(courseConverter.toResponseList(courses, CourseResponse.class));
        return trackResponse;
    }

    public TrackResponse toTrackResponseWithCoursesByAmin(TrackEntity trackEntity,String type) {
        TrackResponse trackResponse = new TrackResponse();
        trackResponse.setCode(trackEntity.getCode());
        trackResponse.setName(trackEntity.getName());
        trackResponse.setDescription(trackEntity.getDescription());
        List <CourseEntity> courses = trackEntity.getCourses();
        if(type.equals("Main")){
            courses = courses.stream().filter(course -> course.getType().equals("MAIN")).toList();
        } else if (type.equals("Support")) {
            courses = courses.stream().filter(course -> course.getType().equals("SUPPORT")).toList();
        }
        trackResponse.setCourses(courseConverter.toCourseResponsesOverView(courses));
        return trackResponse;
    }

    public TrackResponse toTrackResponseWithCoursesByTeacher(TrackEntity trackEntity, String type, Integer teacherId) {
        TrackResponse trackResponse = new TrackResponse();
        trackResponse.setCode(trackEntity.getCode());
        trackResponse.setName(trackEntity.getName());
        trackResponse.setDescription(trackEntity.getDescription());
        List <CourseEntity> courses = trackEntity.getCourses();
        if(type.equals("Main")){
            courses = courses.stream().filter(course -> (course.getType().equals("MAIN") && course.getTeacherprofile().getId().equals(teacherId))).toList();
        } else if (type.equals("Support")) {
            courses = courses.stream().filter(course -> (course.getType().equals("SUPPORT") && course.getTeacherprofile().getId().equals(teacherId))).toList();
        }
        trackResponse.setCourses(courseConverter.toCourseResponsesOverView(courses));
        return trackResponse;
    }

    public TrackResponse toTrackForStudent(EnrollmentEntity enrollmentEntity) {
        TrackEntity trackEntity = enrollmentEntity.getTrack();
        TrackResponse trackResponse = TrackResponse.builder()
                .code(trackEntity.getCode())
                .description(trackEntity.getDescription())
                .build();

        List <CourseResponse> courseResponses = new ArrayList<>();
        enrollmentEntity.getEnrollmentCourses().forEach(enrollmentCourse -> {
            CourseResponse courseResponse = courseConverter.toCourseResponseByStudent(enrollmentCourse.getCourse(),enrollmentCourse.getStatus());
            courseResponse.setCompletedCup(courseService.completedCups(enrollmentCourse.getCourse().getId(), enrollmentCourse.getEnrollment().getStudentProfile().getId()));
            courseResponses.add(courseResponse);
        });
        trackResponse.setCourses(courseResponses);
        return trackResponse;
    }
}
