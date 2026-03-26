package com.mxhieu.doantotnghiep.repository.custom;

import com.mxhieu.doantotnghiep.dto.request.EnrollmentRequest;
import com.mxhieu.doantotnghiep.entity.CourseEntity;

import java.util.List;
import java.util.Optional;

public interface CourseRepositoryCustom {

    Optional<CourseEntity> findNextCourseOfTrack(Integer courseId);
}
