package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.StudentDictionaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentDictionaryRepository extends JpaRepository<StudentDictionaryEntity, Integer> {
    List<StudentDictionaryEntity> findByStudentProfile_Id(Integer id);
    Boolean existsByStudentProfile_IdAndDefinitionExample_Id(Integer id, Integer definitionEx);
}
