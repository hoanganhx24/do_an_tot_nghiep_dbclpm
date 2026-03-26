package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.CourseEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.CourseRepository;
import com.mxhieu.doantotnghiep.repository.LessonRepository;
import com.mxhieu.doantotnghiep.repository.ModuleRepository;
import com.mxhieu.doantotnghiep.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ModuleConverter extends BaseConverter<ModuleEntity, ModuleRequest, ModuleResponse> {
    private final ModelMapper modelMapper;
    private final CourseRepository courseRepository;

    @Override
    public ModuleEntity toEntity(ModuleRequest request, Class<ModuleEntity> entityClass) {
        ModuleEntity module = modelMapper.map(request, entityClass);
        CourseEntity course = courseRepository.findById(request.getCourseId()).orElseThrow(() ->new AppException(ErrorCode.COURSE_NOT_FOUND));
        module.setCourse(course);
        return  module;
    }

    @Override
    public ModuleResponse toResponse(ModuleEntity entity, Class<ModuleResponse> responseClass) {
        ModuleResponse response = super.toResponse(entity, responseClass);
        response.setCourseId(entity.getCourse().getId());
        return response;
    }
    public ModuleResponse toResponseByTeacherOrAdmin(ModuleEntity entity) {
        ModuleResponse response = ModuleResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .orderIndex(entity.getOrderIndex())
                .description(entity.getDescription())
                .type(entity.getType())
                .build();
        return response;
    }

    public ModuleResponse toResponseForStudent(ModuleEntity moduleEntity) {
        return ModuleResponse.builder()
                .id(moduleEntity.getId())
                .title(moduleEntity.getTitle())
                .description(moduleEntity.getDescription())
                .build();
    }
}
