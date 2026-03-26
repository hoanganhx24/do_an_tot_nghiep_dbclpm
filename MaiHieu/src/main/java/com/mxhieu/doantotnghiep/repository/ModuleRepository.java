package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.repository.custom.ModuleRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<ModuleEntity, Integer>, ModuleRepositoryCustom {

    List<ModuleEntity> findByCourseIdOrderByOrderIndex(int courseId);
    ModuleEntity findTopByCourse_IdOrderByOrderIndexAsc(int courseId);
    ModuleEntity findTopByCourse_IdOrderByOrderIndexDesc(int courseId);
}
