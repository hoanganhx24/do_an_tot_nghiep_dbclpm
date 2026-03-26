package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonProgressRepository extends JpaRepository<LessonProgressEntity, Long> {
    List<LessonProgressEntity> findByLesson_IdAndStudentProfile_Id(Integer lessonId, Integer studentProfileId);
}
