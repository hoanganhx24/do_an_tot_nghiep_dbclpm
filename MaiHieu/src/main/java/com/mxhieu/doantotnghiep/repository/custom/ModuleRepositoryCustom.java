package com.mxhieu.doantotnghiep.repository.custom;

public interface ModuleRepositoryCustom {
    Long getMaxOrder(Integer courseId);

    void flushOrderIndex(Integer courseId, Long orderIndex);

    Long getCompletedLessonsOfStudent(Integer ModuleId, Integer studentProfileId);
    void decreaseOrderIndex(Integer courseId, Long orderIndex);
}
