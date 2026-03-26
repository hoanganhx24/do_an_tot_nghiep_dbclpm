package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;

import java.util.List;

public interface ExerciseTypeService {
    List<ExerciseTypeResponse> getExerciseTypes();
}
