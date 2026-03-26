package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.converter.TestAttemptConverter;
import com.mxhieu.doantotnghiep.entity.AssessmentAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswerEntity, Integer> {
    List<AssessmentAnswerEntity> findByAssessmentAttempt_Id(Integer id);
}
