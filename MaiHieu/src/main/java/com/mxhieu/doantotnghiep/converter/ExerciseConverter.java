package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ExerciseConverter extends BaseConverter<ExerciseEntity, Object, ExerciseResponse> {

    public List<ExerciseResponse> toResponseSummaryList(List<ExerciseEntity> entities) {
        List<ExerciseResponse> exerciseResponses = new ArrayList<>();
        for (ExerciseEntity entity : entities) {
            ExerciseResponse exerciseResponse =ExerciseResponse.builder()
                    .id(entity.getId())
                    .title(entity.getTitle())
                    .typeName(entity.getExercisetype().getDescription())
                    .build();
            exerciseResponses.add(exerciseResponse);
        }
        return exerciseResponses;
    }
}
