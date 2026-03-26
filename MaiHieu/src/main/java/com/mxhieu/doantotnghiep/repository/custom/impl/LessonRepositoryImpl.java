package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.repository.custom.LessonRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public class LessonRepositoryImpl implements LessonRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;
    @Override
    public int getMaxOrder(Integer moduleId) {
        StringBuilder sql = new StringBuilder("SELECT COALESCE(MAX(OrderIndex), 0) FROM lesson WHERE ModuleId = :moduleId");
        Object result = entityManager.createNativeQuery(sql.toString())
                .setParameter("moduleId", moduleId)
                .getSingleResult();
        return ((Number) result).intValue();
    }

    @Transactional
    @Override
    public void flushOrderIndex(Integer moduleId, Integer orderIndex) {
        StringBuilder sql = new StringBuilder();
        sql.append("UPDATE lesson ")
           .append("SET OrderIndex = OrderIndex + 1 ")
           .append("WHERE ModuleId = :moduleId ")
           .append("AND OrderIndex >= :orderIndex");
        entityManager.createNativeQuery(sql.toString())
                .setParameter("moduleId", moduleId)
                .setParameter("orderIndex", orderIndex)
                .executeUpdate();
    }

    @Transactional
    @Override
    public void decreaseOrderIndex(Integer moduleId, Integer orderIndex) {
        StringBuilder sql = new StringBuilder();
        sql.append("UPDATE lesson ")
                .append("SET OrderIndex = OrderIndex - 1 ")
                .append("WHERE ModuleId = :moduleId ")
                .append("AND OrderIndex >= :orderIndex");
        entityManager.createNativeQuery(sql.toString())
                .setParameter("moduleId", moduleId)
                .setParameter("orderIndex", orderIndex)
                .executeUpdate();
    }

    @Override
    public int totalScroreOfLesson(Integer lessonId, Integer userId) {
        String sql = """
        SELECT SUM(a.ScorePercent)
        FROM lesson l
        JOIN exercise e ON l.id = e.lessonid
        JOIN attempt a ON e.id = a.exerciseid
        WHERE l.id = :lessonId AND a.studentprofileID = :userId
    """;

        Object result = entityManager.createNativeQuery(sql)
                .setParameter("lessonId", lessonId)
                .setParameter("userId", userId)
                .getSingleResult();

        return result != null ? ((Number) result).intValue() : 0;
    }

    @Override
    public LessonEntity getNextLesson(Integer currentLessonId) {
        String sql = """
        SELECT l2.*
        FROM lesson l1
        JOIN lesson l2 
            ON l1.moduleid = l2.moduleid 
           AND l2.orderindex > l1.orderindex
        WHERE l1.id = :currentLessonId
        ORDER BY l2.orderindex ASC
        LIMIT 1
    """;

        List<LessonEntity> results = entityManager
                .createNativeQuery(sql, LessonEntity.class)
                .setParameter("currentLessonId", currentLessonId)
                .getResultList();

        return results.isEmpty() ? null : results.get(0);
    }

    @Override
    public LessonEntity getPreviousLesson(Integer currentLessonId) {
        String sql = """
        SELECT l2.*
        FROM lesson l1
        JOIN lesson l2 
            ON l1.moduleid = l2.moduleid 
           AND l2.orderindex < l1.orderindex
        WHERE l1.id = :currentLessonId
        ORDER BY l2.orderindex DESC
        LIMIT 1
    """;

        List<LessonEntity> results = entityManager
                .createNativeQuery(sql, LessonEntity.class)
                .setParameter("currentLessonId", currentLessonId)
                .getResultList();

        return results.isEmpty() ? null : results.get(0);
    }


}
