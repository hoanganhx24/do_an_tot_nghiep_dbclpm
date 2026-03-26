package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.TestProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestProgressRepository extends JpaRepository<TestProgressEntity,Integer> {
    List<TestProgressEntity> findByTest_IdAndStudentProfile_Id(Integer testId, Integer studentProfileId);
}
