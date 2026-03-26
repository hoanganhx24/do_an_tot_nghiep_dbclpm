package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.repository.custom.CourseRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<CourseEntity, Integer> , CourseRepositoryCustom {
    List<CourseEntity> findByTeacherprofile_Id(Integer teacherId);

    List<CourseEntity> findByTrack_IdAndStatus(Integer trackId, String status);

    CourseEntity findTopByParentCourse_IdOrderByVersionDesc(Integer parentCourseId);


}
