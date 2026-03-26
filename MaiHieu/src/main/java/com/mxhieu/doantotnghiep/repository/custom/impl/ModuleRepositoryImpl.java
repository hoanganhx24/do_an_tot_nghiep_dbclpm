package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.repository.custom.ModuleRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@SuppressWarnings("JpaQueryApiInspection")
public class ModuleRepositoryImpl implements ModuleRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Long getMaxOrder(Integer courseId) {
        String sql = "SELECT COALESCE(MAX(OrderIndex), 0) FROM module WHERE CourseId = :courseId";
        Object result = entityManager.createNativeQuery(sql)
                .setParameter("courseId", courseId)
                .getSingleResult();
        return ((Number) result).longValue();
    }

    @Transactional
    @Override
    public void flushOrderIndex(Integer courseId, Long orderIndex) {
        String sql = """
            UPDATE module
            SET OrderIndex = OrderIndex + 1
            WHERE CourseId = :courseId
            AND OrderIndex >= :orderIndex
        """;
        entityManager.createNativeQuery(sql)
                .setParameter("courseId", courseId)
                .setParameter("orderIndex", orderIndex)
                .executeUpdate();
    }
    @Transactional
    @Override
    public void decreaseOrderIndex(Integer courseId, Long orderIndex) {
        String sql = """
        UPDATE module
        SET OrderIndex = OrderIndex - 1
        WHERE CourseId = :courseId
        AND OrderIndex >= :orderIndex
    """;
        entityManager.createNativeQuery(sql)
                .setParameter("courseId", courseId)
                .setParameter("orderIndex", orderIndex)
                .executeUpdate();
    }


    @Transactional(readOnly = true)
    @Override
    public Long getCompletedLessonsOfStudent(Integer moduleId, Integer studentProfileId) {
        String sql = """
            SELECT COUNT(DISTINCT l.ID)
            FROM lesson l
            WHERE l.ModuleID = :moduleId
            AND NOT EXISTS (
                SELECT 1
                FROM exercise e
                LEFT JOIN attempt a
                    ON e.ID = a.ExerciseID
                    AND a.StudentProfileID = :studentId
                WHERE e.LessonID = l.ID
                AND a.ID IS NULL
            )
        """;

        try {
            Object result = entityManager.createNativeQuery(sql)
                    .setParameter("moduleId", moduleId)
                    .setParameter("studentId", studentProfileId)
                    .getSingleResult();
            return result != null ? ((Number) result).longValue() : 0L;
        } catch (Exception e) {
            return 0L; // tránh crash nếu dữ liệu rỗng hoặc query lỗi
        }
    }
}
