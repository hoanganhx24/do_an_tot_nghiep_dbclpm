package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.AttemptAnswerEntity;
import com.mxhieu.doantotnghiep.entity.AttemptEntity;
import com.mxhieu.doantotnghiep.repository.custom.AttemptAnswerRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswerEntity, Integer>, AttemptAnswerRepositoryCustom {
    List<AttemptAnswerEntity> findByQuestion_IdAndAttempt_StudentProfile_Id(Integer question_Id, Integer attempt_StudentProfile_Id);
}
