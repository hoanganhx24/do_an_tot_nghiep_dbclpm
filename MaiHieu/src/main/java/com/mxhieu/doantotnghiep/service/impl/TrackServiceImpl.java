package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.TrackConverter;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.EnrollmentRepository;
import com.mxhieu.doantotnghiep.repository.TrackRepository;
import com.mxhieu.doantotnghiep.service.CourseService;
import com.mxhieu.doantotnghiep.service.TrackService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {
    private final TrackRepository trackRepository;
    private final TrackConverter trackConverter;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;
    @Override
    public List<TrackResponse> findAll(String type) {
        List<TrackResponse> results = new ArrayList<>();
        trackRepository.findAll().forEach(track -> {
            results.add(trackConverter.toResponse(track, TrackResponse.class));
        });
        return results;
    }

    @Override
    public TrackResponse getCoursesByTrackCode(String code, String type) {
        return trackConverter.toTrackResponseWithCourses(trackRepository.findByCode(code).orElseThrow(()-> new AppException(ErrorCode.TRACK_NOT_FOUND)),type);
    }


    @Override
    public List<TrackResponse> findAllByTeacher(String type, Integer teacherId) {
        List<TrackEntity> trackEntities = trackRepository.findAll();
        List<TrackResponse> results = trackEntities.stream().map(trackEntity -> trackConverter.toTrackResponseWithCoursesByTeacher(trackEntity,type,teacherId)).toList();
        return results;
    }

    @Override
    public List<TrackResponse> findAllByAdmin(String type) {
        List<TrackEntity> trackEntities = trackRepository.findAll();
        List<TrackResponse> results = trackEntities.stream().map(trackEntity -> trackConverter.toTrackResponseWithCoursesByAmin(trackEntity,type)).toList();
        return results;
    }

    @Override
    public Integer trackDauTienChuaHoanThanhVaMoKhoa(Integer studentId) {
        List<EnrollmentEntity> enrollmentEntities = enrollmentRepository.findByStudentProfile_Id(studentId);
        if(enrollmentEntities.size()==0){
            throw new AppException(ErrorCode.STUDENT_NOT_HAVE_ENROLLMENT);
        }
        Integer findTrackId = -1;
        for(EnrollmentEntity enrollmentEntity : enrollmentEntities){
            if(enrollmentEntity.getStatus().equals(1)){
                findTrackId = enrollmentEntity.getTrack().getId();
            }
        }
        if(findTrackId.equals(-1)){
            throw new AppException(ErrorCode.TRACK_NOT_FOUND);
        }
        return findTrackId;
    }

    @Override
    public Map<String, Object> getLastLessonOfTrack(Integer trackId) {
        Map<String,Object> results = new HashMap<>();
        TrackEntity trackEntity = trackRepository.findById(trackId).orElseThrow(()-> new AppException(ErrorCode.TRACK_NOT_FOUND));
        CourseEntity lastCourseEntitiy = trackEntity.getCourses().get(trackEntity.getCourses().size() -1);
        List<ModuleEntity> moduleEntities = lastCourseEntitiy.getModules();
        moduleEntities.sort(
                Comparator.comparing(ModuleEntity::getOrderIndex)
        );
        ModuleEntity lastModule = moduleEntities.get(moduleEntities.size()-1);
        if(lastModule.getType() == ModuleType.LESSON){
            List<LessonEntity> lessonEntities = lastModule.getLessons();
            lessonEntities.sort(Comparator.comparing(LessonEntity::getOrderIndex));
            LessonEntity lastLesson = lessonEntities.get(lessonEntities.size()-1);
            results.put("id",lastLesson.getId());
            results.put("type","LESSON");
        }else{
            List<TestEntity> testEntities = lastModule.getTests();
            TestEntity lastTest = testEntities.get(0);
            results.put("id",lastTest.getId());
            results.put("type","TEST");
        }

        return  results;
    }
}
