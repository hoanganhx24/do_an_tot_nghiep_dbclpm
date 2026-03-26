package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.repository.custom.ChoiceRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

public class ChoiceRepositoryImpl implements ChoiceRepositoryCustom {
    @PersistenceContext
    private EntityManager em;
    @Override
    public boolean checkCorrectChoice(Integer choiceId) {
        String jpql = "SELECT c.isCorrect FROM ChoiceEntity c WHERE c.id = :choiceId";

        return em.createQuery(jpql, Boolean.class)
                .setParameter("choiceId", choiceId)
                .getSingleResult();
    }
}
