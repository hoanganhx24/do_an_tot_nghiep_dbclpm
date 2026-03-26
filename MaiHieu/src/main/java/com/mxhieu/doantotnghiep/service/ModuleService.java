package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;

import java.util.List;

public interface ModuleService {
    void addModule(ModuleRequest request);
    List<ModuleResponse> getAll();
    Long getMaxOrder(Integer courseId);
    int completedCups(Integer courseId, Integer studentProfileId);
    List<ModuleResponse> getResponseDetailList(List<ModuleEntity> moduleEntities, Integer studentProfileId);
    List<ModuleResponse> getAllModulesOfCourse(int courseId);
    void updateModule(ModuleRequest request);
    void deleteModule(Integer id);
    boolean isCompleted(Integer moduleId, Integer studentId );
}
