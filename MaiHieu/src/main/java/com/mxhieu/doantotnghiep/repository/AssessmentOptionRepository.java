package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.AssessmentOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentOptionRepository extends JpaRepository<AssessmentOptionEntity, Integer> {
    void deleteByAssessmentQuestion_Id(Integer id);
    List<AssessmentOptionEntity> findByAssessmentQuestion_Id(Integer id);
}
