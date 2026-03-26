package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeacheprofileRepository extends JpaRepository<TeacherprofileEntity,Integer> {
    @Query("SELECT t FROM TeacherprofileEntity t WHERE t.user.status = 'ACTIVE'")
    List<TeacherprofileEntity> findAllActiveTeachers();

}
