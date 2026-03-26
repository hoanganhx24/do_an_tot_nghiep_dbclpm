package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Integer> {
    List<EnrollmentEntity> findByStudentProfile_Id(Integer studentId);
    List<EnrollmentEntity> findByTrack_IdAndStudentProfile_Id(Integer trackId, Integer studentId);
}
