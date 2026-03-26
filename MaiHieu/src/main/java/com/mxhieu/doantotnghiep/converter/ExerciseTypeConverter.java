package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.ExerciseTypeRequest;
import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import org.springframework.stereotype.Component;

@Component
public class ExerciseTypeConverter extends BaseConverter<ExerciseTypeEntity, ExerciseTypeRequest, ExerciseTypeResponse> {
}
