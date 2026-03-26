package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;

public interface LessonProgressService {
    Boolean checkCompletionCondition(LessonProgressRequest request);
    void unLockNextCourse(CourseEntity course, StudentProfileEntity studentProfileEntity);
    void unLockNextTrack(TrackEntity trackEntity, StudentProfileEntity studentProfileEntity);
}
