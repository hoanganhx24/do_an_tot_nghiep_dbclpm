package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.AttemptEntity;
import com.mxhieu.doantotnghiep.repository.custom.AttemptRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttemptRepository extends JpaRepository<AttemptEntity, Integer> , AttemptRepositoryCustom {
    AttemptEntity findFirstByStudentProfileIdAndExerciseIdOrderByIdAsc(Integer studentProfileId, Integer exerciseId);
}
