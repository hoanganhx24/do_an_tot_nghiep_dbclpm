package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.MediaAssetEntity;
import com.mxhieu.doantotnghiep.utils.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Component
public class MediaAssetConverter extends BaseConverter <Object, Object, Object> {
    @Autowired
    private FileUtils fileUtils;
    public List <MediaAssetEntity> toListMediaAssetEntity(List<MultipartFile> mediaAssets, LessonEntity lessonEntity) {
        return mediaAssets.stream().map(mediaAsset -> toMediaAssetEntity(mediaAsset, lessonEntity)).toList();
    }
    public MediaAssetEntity toMediaAssetEntity(MultipartFile mediaAsset, LessonEntity lessonEntity){
        fileUtils.validateFile(mediaAsset);
        MediaAssetEntity mediaassetEntity = new MediaAssetEntity();
        mediaassetEntity.setType(mediaAsset.getContentType());
        try {
            mediaassetEntity.setMediaData(mediaAsset.getBytes());
            mediaassetEntity.setName(mediaAsset.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        mediaassetEntity.setLesson(lessonEntity);
        return mediaassetEntity;
    }
}
