package com.mxhieu.doantotnghiep.repository.custom.impl;

import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.repository.custom.CourseRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class CourseRepositoryImpl implements CourseRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    public Optional<CourseEntity> findNextCourseOfTrack(Integer courseId) {
        String sql = """
            select c2.*
            from course c1
            join course c2 on c2.TrackId = c1.TrackId
            where c1.id = :courseId
              and c2.id = c1.id + 1
        """;

        return em.createNativeQuery(sql, CourseEntity.class)
                .setParameter("courseId", courseId)
                .getResultStream()
                .findFirst();
    }
}
