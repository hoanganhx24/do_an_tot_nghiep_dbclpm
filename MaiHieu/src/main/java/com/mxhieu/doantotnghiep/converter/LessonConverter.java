package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.LessonRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.MaterialResponse;
import com.mxhieu.doantotnghiep.dto.response.MediaAssetResponse;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.repository.LessonRepository;
import com.mxhieu.doantotnghiep.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Component
public class LessonConverter extends BaseConverter<LessonEntity, LessonRequest, LessonResponse> {
    @Autowired
    ModelMapper modelMapper;
    @Override
    public LessonResponse toResponse(LessonEntity entity, Class<LessonResponse> responseClass) {
        LessonResponse result = super.toResponse(entity, responseClass);

        result.setMaterials(
                entity.getMaterialEntities().stream()
                        .map(m -> MaterialResponse.builder()
                                .id(m.getId())
                                .title(m.getTitle())
                                .type(m.getType())
                                .url(m.getUrl())
                                .materialData(m.getMaterialData())
                                .build())
                        .toList()
        );
        if (entity.getMediaassets() != null) {
            try{
                result.setVideoPath(entity.getMediaassets().get(0).getUrl());
                String relativePath = entity.getMediaassets().get(0).getUrl();
                Path videoPath = Paths.get(System.getProperty("user.dir"), relativePath);
                byte[] fullBytes = Files.readAllBytes(videoPath);
                result.setVideoSize((long)fullBytes.length);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        } else {
            result.setVideoPath(null);
        }
        return result;
    }
    public LessonResponse toResponseNoMaterialMediaasset(LessonEntity lessonEntity) {
        LessonResponse response = LessonResponse.builder()
                .id(lessonEntity.getId())
                .title(lessonEntity.getTitle())
                .summary(lessonEntity.getSummary())
                .durationMinutes(lessonEntity.getDurationMinutes())
                .orderIndex(lessonEntity.getOrderIndex())
                .gatingRules(lessonEntity.getGatingRules())
                .build();
        return response;
    }

    public List<LessonResponse> toResponseByTeacherOrAdmin(List<LessonEntity> lessons) {
        List<LessonResponse> responses = new ArrayList<>();
        for (LessonEntity lesson : lessons) {
            LessonResponse response = LessonResponse.builder()
                    .id(lesson.getId())
                    .title(lesson.getTitle())
                    .orderIndex(lesson.getOrderIndex())
                    .build();
            responses.add(response);
        }
        Collections.sort(responses, (a, b) -> a.getOrderIndex().compareTo(b.getOrderIndex()));
        return responses;
    }
}
