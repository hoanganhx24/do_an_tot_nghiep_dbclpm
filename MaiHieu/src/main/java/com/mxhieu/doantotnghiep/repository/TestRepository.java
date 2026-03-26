package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestRepository extends JpaRepository<TestEntity, Integer> {
    List<TestEntity> findByType(String type);
    List<TestEntity> findByModuleId(Integer moduleId);
    long countByModuleId(Integer moduleId);

}
