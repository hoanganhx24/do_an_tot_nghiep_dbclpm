package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.dto.request.QuestionRequest;
import com.mxhieu.doantotnghiep.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<QuestionEntity, Integer> {
}
