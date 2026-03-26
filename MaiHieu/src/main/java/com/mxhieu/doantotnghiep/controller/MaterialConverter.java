package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.MaterialEntity;
import com.mxhieu.doantotnghiep.utils.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Component
public class MaterialConverter extends BaseConverter<Object, Object, Object> {

    @Autowired
    private FileUtils fileUtils;

    // ✅ Hàm chuyển 1 file thành 1 MaterialEntity
    public MaterialEntity toMaterialEntity(MultipartFile request, LessonEntity lesson) {
        fileUtils.validateFile(request);
        MaterialEntity materialEntity = new MaterialEntity();
        materialEntity.setTitle(request.getOriginalFilename());
        materialEntity.setType(request.getContentType());
        try {
            materialEntity.setMaterialData(request.getBytes());
            materialEntity.setName(request.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        materialEntity.setLesson(lesson); // liên kết với bài học
        return materialEntity;
    }

    // ✅ Hàm chuyển danh sách file thành danh sách MaterialEntity
    public List<MaterialEntity> toListMaterialEntity(List<MultipartFile> files, LessonEntity lesson) {
        return files.stream()
                .map(file -> toMaterialEntity(file, lesson))
                .toList();
    }
}
