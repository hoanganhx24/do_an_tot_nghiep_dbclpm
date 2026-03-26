package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;
import com.mxhieu.doantotnghiep.repository.TeacheprofileRepository;
import com.mxhieu.doantotnghiep.repository.TrackRepository;
import com.mxhieu.doantotnghiep.service.CourseService;
import com.mxhieu.doantotnghiep.utils.FileUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CourseConverter extends BaseConverter<CourseEntity, CourseRequest, CourseResponse> {
    private final ModelMapper modelMapper;
    private final TrackRepository trackRepository;
    private final TeacheprofileRepository teacheprofileRepository;
    private final FileUtils fileUtils;

    public CourseEntity toCourseEntity(CourseRequest request, MultipartFile file) {
        CourseEntity course = modelMapper.map(request, CourseEntity.class);

        // 🔹 Tìm track theo code
        TrackEntity track = trackRepository.findByCode(request.getTrackCode())
                .orElseThrow(() -> new RuntimeException("Track not found"));

        // 🔹 Tìm teacherprofile
        TeacherprofileEntity teacher = teacheprofileRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        course.setTrack(track);
        course.setStatus("NEW");
        course.setVersion(0);
        course.setTeacherprofile(teacher);

        try {
            if (file != null && !file.isEmpty()) {
                fileUtils.validateFile(file);
                course.setImgData(file.getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error reading file: " + e.getMessage());
        }

        return course;
    }

    public CourseResponse toCourseResponse(CourseEntity course) {
        CourseResponse response = modelMapper.map(course, CourseResponse.class);
        return response;
    }

    public CourseResponse toCourseResponseByTeacher(CourseEntity courseEntity) {
        CourseResponse response = new CourseResponse();
        response.setId(courseEntity.getId());
        response.setTitle(courseEntity.getTitle());
        response.setDescription(courseEntity.getDescription());
        response.setTrackName(courseEntity.getTrack().getName());
        response.setStatus(courseEntity.getStatus());
        response.setVersion(courseEntity.getVersion());
        response.setVersions(getVersion(courseEntity));
        return response;
    }
    private List<Integer> getVersion(CourseEntity courseEntity) {
        if(!courseEntity.getStatus().equals("PUBLISHED") ){
            return courseEntity.getChildren().stream().map(course -> course.getVersion()).toList();
        }else{
            return courseEntity.getParentCourse().getChildren().stream().map(course -> course.getVersion()).toList();
        }
    }
    public List<CourseResponse> toCourseResponsesOverView(List<CourseEntity> courses) {
        List<CourseResponse> courseResponses = new ArrayList<>();
        courses.forEach(course -> {
            if(!course.getStatus().equals("PUBLISHED")) {
                CourseResponse response = new CourseResponse();
                response.setId(course.getId());
                response.setTitle(course.getTitle());
                response.setDescription(course.getDescription());
                response.setImgData(course.getImgData());
                response.setVersion(course.getVersion());
                response.setTeacherName(course.getTeacherprofile().getUser().getFullName());
                response.setStatus(course.getStatus());
                courseResponses.add(response);
            }
        });
        return courseResponses;
    }

    public CourseResponse toCourseResponseByStudent(CourseEntity courseEntity, String status) {
        CourseResponse response = new CourseResponse();
        response.setId(courseEntity.getId());
        response.setTitle(courseEntity.getTitle());
        response.setDescription(courseEntity.getDescription());
        response.setLock(status);
        response.setImgData(courseEntity.getImgData());
        return response;
    }
}
