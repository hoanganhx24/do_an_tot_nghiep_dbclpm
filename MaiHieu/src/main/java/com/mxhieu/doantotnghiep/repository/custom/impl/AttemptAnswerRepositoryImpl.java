package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.entity.AttemptAnswerEntity;
import com.mxhieu.doantotnghiep.entity.AttemptEntity;
import com.mxhieu.doantotnghiep.repository.custom.AttemptAnswerRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class AttemptAnswerRepositoryImpl implements AttemptAnswerRepositoryCustom {
    @PersistenceContext
    EntityManager em;



}
