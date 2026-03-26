package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import com.mxhieu.doantotnghiep.repository.custom.ExerciseRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<ExerciseEntity, Integer>, ExerciseRepositoryCustom {
    int countByLessonId(Integer lessonId);
    @Query("SELECT e.id FROM ExerciseEntity e WHERE e.lesson.id = ?1 ORDER BY e.orderIndex ASC")
    List<Integer> findAllExerciseIdsByLessonId(Integer lessonId);

    List<ExerciseEntity> findByLessonId(Integer lessonId);
    List<ExerciseEntity> findByLesson_IdAndExercisetype_Code(Integer lessonId, String exerciseTypeCode);
    List<ExerciseEntity> findByLesson_IdAndExercisetype_CodeAndIdNot(Integer lessonId, String exercisetypeCode, Integer id);
}
