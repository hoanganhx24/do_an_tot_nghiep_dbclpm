package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.repository.custom.LessonRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<LessonEntity, Integer>, LessonRepositoryCustom {
    List<LessonEntity> findByModuleId(int moduleId);
    Long countByModuleId(int moduleId);
    LessonEntity findTopByModule_IdOrderByOrderIndexDesc(Integer moduleId);

}
