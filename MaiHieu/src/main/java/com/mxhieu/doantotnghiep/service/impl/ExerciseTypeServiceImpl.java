package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.ExerciseTypeConverter;
import com.mxhieu.doantotnghiep.dto.response.ExerciseTypeResponse;
import com.mxhieu.doantotnghiep.entity.ExerciseTypeEntity;
import com.mxhieu.doantotnghiep.repository.ExerciseTypeRepository;
import com.mxhieu.doantotnghiep.service.ExerciseTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class ExerciseTypeServiceImpl implements ExerciseTypeService {
    private final ExerciseTypeRepository exercisetypeRepository;
    private final ExerciseTypeConverter exercisetypeConverter;
    @Override
    public List<ExerciseTypeResponse> getExerciseTypes() {
        return exercisetypeConverter.toResponseList(exercisetypeRepository.findAll(), ExerciseTypeResponse.class);
    }
}
