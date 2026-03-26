package com.mxhieu.doantotnghiep.repository.custom;

public interface ExerciseRepositoryCustom {
    void flushOrderIndex(Integer lessonId, Integer orderIndex);
    int getMaxOrder(Integer lessonId);

    boolean isExerciseCompletedByStudent(Integer exerciseId, Integer studentProfileId);
}
