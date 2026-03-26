package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.repository.custom.ExerciseRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseTypeRepository extends JpaRepository<ExerciseTypeEntity, Integer> {
    Optional<ExerciseTypeEntity> findByCode(String code);
}
