package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.repository.custom.ExerciseRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

public class ExerciseRepositoryImpl implements ExerciseRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public int getMaxOrder(Integer lessonId) {
        StringBuilder sql = new StringBuilder(
                "SELECT COALESCE(MAX(OrderIndex), 0) FROM exercise WHERE LessonId = :lessonId"
        );
        Object result = entityManager.createNativeQuery(sql.toString())
                .setParameter("lessonId", lessonId)
                .getSingleResult();
        return ((Number) result).intValue();
    }

    @Override
    public boolean isExerciseCompletedByStudent(Integer exerciseId, Integer studentProfileId) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM attempt ")
                .append("WHERE ExerciseId = :exerciseId ")
                .append("AND StudentProfileId = :studentProfileId ");
        Object result = entityManager.createNativeQuery(sql.toString())
                .setParameter("exerciseId", exerciseId)
                .setParameter("studentProfileId", studentProfileId)
                .getSingleResult();
        int count = ((Number) result).intValue();
        return count > 0;

    }

    @Transactional
    @Override
    public void flushOrderIndex(Integer lessonId, Integer orderIndex) {
        StringBuilder sql = new StringBuilder();
        sql.append("UPDATE exercise ")
                .append("SET OrderIndex = OrderIndex + 1 ")
                .append("WHERE LessonId = :lessonId ")
                .append("AND OrderIndex >= :orderIndex");

        entityManager.createNativeQuery(sql.toString())
                .setParameter("lessonId", lessonId)
                .setParameter("orderIndex", orderIndex)
                .executeUpdate();
    }
}
