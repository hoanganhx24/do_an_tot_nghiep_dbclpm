package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.ExerciseConverter;
import com.mxhieu.doantotnghiep.dto.request.ExerciseRequest;
import com.mxhieu.doantotnghiep.dto.response.ChoiceResponse;
import com.mxhieu.doantotnghiep.dto.response.ExerciseResponse;
import com.mxhieu.doantotnghiep.dto.response.QuestionResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {
    private  final ExerciseRepository exerciseRepository;
    private  final ExerciseTypeRepository exerciseTypeRepository;
    private  final LessonRepository lessonRepository;
    private final ExerciseConverter exerciseConverter;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final AttemptRepository attemptRepository;
    @Transactional

    @Override
    public void flushOrderIndex(Integer lessonId, Integer orderIndex) {
        exerciseRepository.flushOrderIndex(lessonId, orderIndex);
    }

    @Override
    public int getMaxOrder(Integer lessonId) {
        return exerciseRepository.getMaxOrder(lessonId) + 1;
    }


    @Override
    public ExerciseResponse getExerciseDetailById(Integer exerciseId, Integer studentProfileId) {
        ExerciseEntity exerciseEntity = exerciseRepository.findById(exerciseId).orElseThrow(()-> new AppException(ErrorCode.EXERCISE_NOT_FOUND));
        boolean isCompleted = exerciseRepository.isExerciseCompletedByStudent(exerciseId, studentProfileId);
        ExerciseResponse response = exerciseConverter.toResponse(exerciseEntity, ExerciseResponse.class);


        response.setTypeCode(exerciseEntity.getExercisetype().getCode());
        response.setIsCompleted(isCompleted);
        if(isCompleted){
            List<QuestionResponse> questionResponses = response.getQuestions();
            for(QuestionResponse questionResponse : questionResponses){
                List<AttemptAnswerEntity> attemptAnswerEntitys = attemptAnswerRepository.findByQuestion_IdAndAttempt_StudentProfile_Id(questionResponse.getId(), studentProfileId);
                if(attemptAnswerEntitys.isEmpty()){
                    throw new AppException(ErrorCode.CHOICE_NOT_FOUND_BY_QUESTION_AND_STUDENT);
                }
                AttemptAnswerEntity attemptAnswerEntity = attemptAnswerEntitys.get(0);
                for (ChoiceResponse choiceResponse : questionResponse.getChoices()) {
                    if(attemptAnswerEntity.getChoice().getId().equals(choiceResponse.getId())){
                        choiceResponse.setSelected(true);
                        choiceResponse.setIsCorrect(attemptAnswerEntity.getIsCorrect());
                    }else{
                        choiceResponse.setSelected(false);
                    }
                }
            }
        }
        return response;
    }

    @Override
    public List<ExerciseResponse> getSummaryExercisesByLessonId(Integer lessonId) {
        List<ExerciseEntity> entities = exerciseRepository.findByLessonId(lessonId);
        List<ExerciseResponse> exerciseResponses = exerciseConverter.toResponseSummaryList(entities);
        return exerciseResponses;
     }


    @Override
    public void createExercise(ExerciseRequest exerciseRequest) {
        LessonEntity lessonEntity = lessonRepository.findById(exerciseRequest.getLessonID()).orElseThrow(()-> new AppException(ErrorCode.LESSON_NOT_FOUND));
        ExerciseTypeEntity exerciseTypeEntity = exerciseTypeRepository.findByCode(exerciseRequest.getType()).orElseThrow(()-> new AppException(ErrorCode.EXERCISE_TYPE_NOT_FOUND));
        ExerciseEntity exerciseEntity = exerciseConverter.toEntity(exerciseRequest, ExerciseEntity.class);
        exerciseEntity.setOrderIndex(getMaxOrder(exerciseRequest.getLessonID()));
        exerciseEntity.setLesson(lessonEntity);
        exerciseEntity.setExercisetype(exerciseTypeEntity);
        if(exerciseRequest.getShowTime() != null ){
            List<ExerciseEntity> interactiveExercises = exerciseRepository.findByLesson_IdAndExercisetype_Code(
                    exerciseEntity.getLesson().getId(),
                    "INTERACTIVE"
            );
            checkTimeShowTime(exerciseRequest.getShowTime(),lessonEntity.getMediaassets());
            checkExistShowTime(exerciseRequest.getShowTime(), interactiveExercises);
            exerciseEntity.setShowTime(exerciseRequest.getShowTime());
        }
        exerciseRepository.save(exerciseEntity);
    }

    @Override
    public void updateExercise(ExerciseRequest exerciseRequest) {
        ExerciseEntity exerciseEntity = exerciseRepository.findById(exerciseRequest.getId()).orElseThrow(()-> new AppException(ErrorCode.EXERCISE_NOT_FOUND));
        if(exerciseRequest.getTitle() != null){
            exerciseEntity.setTitle(exerciseRequest.getTitle());
        }
        if(exerciseRequest.getParagraphs() != null){
            exerciseEntity.setParagraphs(exerciseRequest.getParagraphs());
        }
        if(exerciseRequest.getImageData() != null){
            exerciseEntity.setImageData(exerciseRequest.getImageData());
        }
        if(exerciseRequest.getMediaData() != null){
            exerciseEntity.setMediaData(exerciseRequest.getMediaData());
        }
        if(exerciseRequest.getShowTime() != null){
            LessonEntity lessonEntity = exerciseEntity.getLesson();
            List<ExerciseEntity> interactiveExercises = exerciseRepository.findByLesson_IdAndExercisetype_CodeAndIdNot(
                    exerciseEntity.getLesson().getId(),
                    "INTERACTIVE",
                    exerciseEntity.getId()
            );
            checkTimeShowTime(exerciseRequest.getShowTime(),lessonEntity.getMediaassets());
            checkExistShowTime(exerciseRequest.getShowTime(), interactiveExercises);
            exerciseEntity.setShowTime(exerciseRequest.getShowTime());
        }
        exerciseRepository.save(exerciseEntity);
    }

    private void checkTimeShowTime(LocalTime showTime, List<MediaAssetEntity> mediaAssetEntities) {
        if(mediaAssetEntities != null && mediaAssetEntities.isEmpty()){
            throw new AppException(ErrorCode.LESSON_NOT_HAS_MEDIA);
        }
        Integer lengthSec = mediaAssetEntities.get(0).getLengthSec();
        if (showTime == null || lengthSec == null) {
            throw new AppException(ErrorCode.SHOWTIME_AND_LENGTHSEC_NULL);
        }

        // Chuyển LocalTime → tổng số giây trong ngày
        int showSeconds = showTime.toSecondOfDay();

        // Thời gian xuất hiện phải nhỏ hơn tổng thời lượng video
        if(showSeconds > lengthSec){
            throw new AppException(ErrorCode.SHOWTIME_INVALID);
        }
    }
    private void checkExistShowTime(LocalTime showTime, List<ExerciseEntity> interactiveExercises) {
        for (ExerciseEntity exercise : interactiveExercises) {
            if(exercise.getShowTime() != null && exercise.getShowTime().equals(showTime))
                throw new AppException(ErrorCode.SHOWTIME_EXISTED);
        }
    }

    @Override
    public ExerciseResponse getExerciseDetailById(Integer id) {
        ExerciseEntity exerciseEntity = exerciseRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.EXERCISE_NOT_FOUND));
        ExerciseResponse response = exerciseConverter.toResponse(exerciseEntity, ExerciseResponse.class);
        return response;
    }

    @Override
    public void deleteExcercise(Integer id) {
        exerciseRepository.deleteById(id);
    }

    @Override
    public List<ExerciseResponse> getExerciseDetailsByLessonIdForStudent(Integer lessonId, Integer studentProfileId) {
        List<ExerciseEntity> entities = exerciseRepository.findByLessonId(lessonId);
        List<ExerciseResponse> responses = new ArrayList<>();
        for (ExerciseEntity entity : entities) {
            if(!entity.getExercisetype().getCode().equals("INTERACTIVE")){
                boolean isCompleted = exerciseRepository.isExerciseCompletedByStudent(entity.getId(), studentProfileId);
                ExerciseResponse response = getExerciseDetailById(entity.getId(), studentProfileId);
                response.setIsCompleted(isCompleted);
                responses.add(response);
            }
        }
        return  responses;
    }

    @Override
    public List<ExerciseResponse> getInteractiveExerciseByLessonIdForStudent(Integer lessonId, Integer studentProfileId) {
        List<ExerciseEntity> entities = exerciseRepository.findByLessonId(lessonId);
        List<ExerciseResponse> responses = new ArrayList<>();
        for (ExerciseEntity entity : entities) {
            if(entity.getExercisetype().getCode().equals("INTERACTIVE")){
                boolean isCompleted = exerciseRepository.isExerciseCompletedByStudent(entity.getId(), studentProfileId);
                ExerciseResponse response = getExerciseDetailById(entity.getId(), studentProfileId);
                response.setIsCompleted(isCompleted);
                responses.add(response);
            }
        }
        return  responses;
    }


}
