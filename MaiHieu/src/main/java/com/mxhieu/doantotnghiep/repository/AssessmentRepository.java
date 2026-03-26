package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;
import com.mxhieu.doantotnghiep.entity.AssessmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<AssessmentEntity, Integer> {
    List<AssessmentEntity> findByTestId(Integer testId);
}
