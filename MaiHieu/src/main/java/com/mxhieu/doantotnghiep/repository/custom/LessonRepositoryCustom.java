package com.mxhieu.doantotnghiep.repository.custom;

import com.mxhieu.doantotnghiep.entity.LessonEntity;

public interface LessonRepositoryCustom {
    int getMaxOrder(Integer moduleId);
    void flushOrderIndex(Integer moduleId, Integer orderIndex);
    void decreaseOrderIndex(Integer moduleId, Integer orderIndex);
    int totalScroreOfLesson(Integer lessonId, Integer userId);
    LessonEntity getNextLesson(Integer currentLessonId);
    LessonEntity getPreviousLesson(Integer currentLessonId);
}
