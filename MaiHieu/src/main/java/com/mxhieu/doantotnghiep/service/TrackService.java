package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.EnrollmentEntity;

import java.util.List;
import java.util.Map;

public interface TrackService {
    List<TrackResponse> findAll(String type);

    TrackResponse getCoursesByTrackCode(String code,String type);

    List<TrackResponse> findAllByTeacher(String type,Integer teacherId);

    List<TrackResponse> findAllByAdmin(String type);

    Integer trackDauTienChuaHoanThanhVaMoKhoa(Integer studentId);

    Map<String,Object> getLastLessonOfTrack(Integer trackId);
}
