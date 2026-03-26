package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.StudyPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlanEntity, Integer> {
    List<StudyPlanEntity> findByTrack_IdAndStudentProfile_Id(Integer trackId, Integer studentId);

    List<StudyPlanEntity> findByStudentProfile_Id(Integer studentProfileId);
}
