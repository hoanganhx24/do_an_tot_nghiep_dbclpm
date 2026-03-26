package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.ExerciseAndQuestionRequest;
import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;

import java.util.List;

public interface ExerciseService {
    void flushOrderIndex(Integer lessonId, Integer orderIndex);
    int getMaxOrder(Integer lessonId);
    ExerciseResponse getExerciseDetailById(Integer exerciseId, Integer studentProfileId);

    List<ExerciseResponse> getSummaryExercisesByLessonId(Integer lessonId);

    void createExercise(ExerciseRequest exerciseRequest);

    ExerciseResponse getExerciseDetailById(Integer id);

    void deleteExcercise(Integer id);

    List<ExerciseResponse> getExerciseDetailsByLessonIdForStudent(Integer lessonId, Integer studentProfileId);

    List<ExerciseResponse> getInteractiveExerciseByLessonIdForStudent(Integer lessonId, Integer studentProfileId);

    void updateExercise(ExerciseRequest exerciseRequest);
}
