package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.CourseConverter;
import com.mxhieu.doantotnghiep.converter.LessonConverter;
import com.mxhieu.doantotnghiep.converter.ModuleConverter;
import com.mxhieu.doantotnghiep.converter.TestConverter;
import com.mxhieu.doantotnghiep.dto.request.CourseRequest;
import com.mxhieu.doantotnghiep.dto.response.CourseResponse;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.CourseRepository;
import com.mxhieu.doantotnghiep.service.CourseService;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.ModuleService;
import com.mxhieu.doantotnghiep.utils.ModuleComparator;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final CourseConverter courseConverter;
    private final LessonService lessonService;
    private final ModuleService moduleService;
    private final LessonConverter lessonConverter;
    private final TestConverter testConverter;

    private final ModuleConverter moduleConverter;
    @Override
    public void addCourseToTrack(CourseRequest request, MultipartFile file) {
        CourseEntity course = courseConverter.toCourseEntity(request, file);
        courseRepository.save(course);
    }
    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(courseConverter::toCourseResponse)
                .toList();
    }

    @Override
    public CourseResponse getCourseById(Integer id) {
        CourseResponse response = courseConverter.toCourseResponse(courseRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.COURSE_NOT_FOUND)));
        return response;
    }


    @Override
    public List<CourseResponse> getCoursesByTeacherId(Integer teacherId) {
        return courseRepository.findByTeacherprofile_Id(teacherId)
                .stream()
                .map(courseConverter::toCourseResponseByTeacher)
                .toList();
    }

    @Override
    public CourseResponse getCourseAndModuleByCourseIdForTeacher(CourseRequest courseRequest) {
        CourseEntity courseEntity = courseRepository.findById(courseRequest.getId()).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(courseRequest.getVersion() != null){
            if(courseEntity.getStatus().equals("PUBLISHED")){
                CourseEntity courseParent = courseEntity.getParentCourse();
                courseEntity = courseParent.getChildren().stream().filter(course -> course.getVersion().equals(courseRequest.getVersion())).toList().get(0);
            }else{
                courseEntity = courseEntity.getChildren().stream().filter(course -> course.getVersion().equals(courseRequest.getVersion())).toList().get(0);
            }

        }else{
            if(courseEntity.getStatus().equals("PUBLISHED")){
                courseEntity = courseEntity.getParentCourse();
            }
        }
        CourseResponse response = courseConverter.toCourseResponseByTeacher(courseEntity);
        List<ModuleResponse> moduleResponses = new ArrayList<>();
        for(ModuleEntity moduleEntity : courseEntity.getModules()){
            ModuleResponse moduleResponse = moduleConverter.toResponseByTeacherOrAdmin(moduleEntity);
            if(moduleEntity.getLessons().size() != 0){
                moduleResponse.setLessons(lessonConverter.toResponseByTeacherOrAdmin(moduleEntity.getLessons()));
            }else if(moduleEntity.getTests().size() != 0){
                moduleResponse.setTests(testConverter.toResponseByTeacherOrAdmin(moduleEntity.getTests()));
            }
            moduleResponses.add(moduleResponse);
        }
        Collections.sort(moduleResponses, new ModuleComparator());
        response.setModules(moduleResponses);
        return response;
    }

    @Transactional
    @Override
    public void publishCourse(Integer id) {
        CourseEntity courseEntity = courseRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(courseEntity.getStatus().equals("PUBLISH")){
            throw new AppException(ErrorCode.COURSE_PUBLISHED);
        }
        CourseEntity publishedCourseEntity = courseEntity.clone();
        publishedCourseEntity.setStatus("PUBLISHED");
        publishedCourseEntity.setParentCourse(courseEntity);
        courseEntity.setVersion(courseEntity.getVersion() + 1);
        courseEntity.setStatus("OLD");

        List<ModuleEntity> moduleEntities = courseEntity.getModules();
        if(moduleEntities.isEmpty()){
            throw new AppException(ErrorCode.COURSE_EMPTY_MODULE);
        }

        moduleEntities.forEach(moduleEntity -> {
            if(moduleEntity.getType() == ModuleType.LESSON){
                List<LessonEntity> lessonEntities = moduleEntity.getLessons();
                if(lessonEntities.isEmpty()){
                    throw new AppException(ErrorCode.MODULE_LESSON_EMPTY,"Module: " + moduleEntity.getTitle() + " không có bài học nào");
                }
                lessonEntities.forEach(lessonEntity -> {
                    if(lessonEntity.getMediaassets().isEmpty()){
                        throw new AppException(ErrorCode.LESSON_NOT_HAS_MEDIA,"Module: " +moduleEntity.getTitle() + "\nLesson: " + lessonEntity.getTitle() + "không có video");
                    }
                    List<ExerciseEntity> exerciseEntities = lessonEntity.getExercises();
                    if(!exerciseEntities.isEmpty()) {
                        exerciseEntities.forEach(exerciseEntity -> {
                            List<QuestionEntity> questionEntities = exerciseEntity.getQuestions();
                            if (questionEntities.isEmpty()){
                                throw new AppException(ErrorCode.EXERCISE_QUESTION_EMPTY,"Module: " +moduleEntity.getTitle() + "\nLesson: " + lessonEntity.getTitle() + "\nExercise: " + exerciseEntity.getTitle() + " không có câu hỏi nào");
                            }
                            questionEntities.forEach(questionEntity -> {
                                List<ChoiceEntity> choiceEntities = questionEntity.getChoices();
                                if(choiceEntities.isEmpty()){
                                    throw new AppException(ErrorCode.QUESSTION_CHOICE_EMPTY,"Module: " +moduleEntity.getTitle() + "\nLesson: " + lessonEntity.getTitle() + "\nExercise: " + exerciseEntity.getTitle() + "\nQuesstion: " + questionEntity.getQuestionText() + " không có lựa chọn nào");
                                }
                            });
                        });
                    }
                });
            }else{
                List<TestEntity> testEntities = moduleEntity.getTests();
                if(testEntities.isEmpty()){
                    throw new AppException(ErrorCode.MODULE_TESR_EMPTY,"Module: " + moduleEntity.getTitle() + " không có bài test nào");
                }
                TestEntity testEntity = testEntities.get(0);
                List<AssessmentEntity> assessmentEntities = testEntity.getAssessments();
                if(!assessmentEntities.isEmpty()) {
                    assessmentEntities.forEach(assessmentEntity -> {
                       if(assessmentEntity.getAssessmentQuestions().isEmpty()){
                           throw new AppException(ErrorCode.ASSESSMENT_QUESSTION_EMPTY,"Module: " +moduleEntity.getTitle() + "\nTest: " + testEntity.getName() + "\nAssessment: " + assessmentEntity.getTitle() + " không có câu hỏi nào");
                       }

                        assessmentEntity.getAssessmentQuestions().forEach(assessmentQuestionEntity -> {
                            if(assessmentQuestionEntity.getAssessmentOptions().isEmpty()){
                                throw new AppException(ErrorCode.QUESSTION_CHOICE_EMPTY, "Module: " +moduleEntity.getTitle() + "\nTest: " + testEntity.getName() + "\nAssessment: " + assessmentEntity.getTitle() + "\nAssessmentQuestion: " + assessmentQuestionEntity.getStem() + " không có lựa chọn nào");
                            }
                        });
                    });
                }else{
                    throw new AppException(ErrorCode.ASSESSMENT_OF_TEST_EMPTY,"Module: " + moduleEntity.getTitle() +"\nTest: " + testEntity.getName() + "không có bài tập nào");
                }
            }
        });


        courseRepository.save(courseEntity);
        courseRepository.save(publishedCourseEntity);
    }

    @Override
    public String completedCups(Integer courseId, Integer studentProfileId) {
        int completedCups = 0;
        int totalCups = 0;
        List<ModuleEntity> moduleEntities = courseRepository.findById(courseId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND)).getModules();
        for (ModuleEntity moduleEntity : moduleEntities) {
            totalCups += moduleEntity.getLessons().size() * 3;
            completedCups += moduleService.completedCups(moduleEntity.getId(), studentProfileId);
        }
        return completedCups + "/" + totalCups;
    }

    @Override
    public CourseResponse getCourseForStudent(CourseRequest courseRequest) {
        CourseEntity courseEntity = courseRepository.findById(courseRequest.getId()).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        CourseResponse response = courseConverter.toCourseResponseByStudent(courseEntity, courseEntity.getStatus());
        List<ModuleResponse> moduleResponses = moduleService.getResponseDetailList(courseEntity.getModules(), courseRequest.getStudentProfileId());
        Collections.sort(moduleResponses, (m1, m2) -> Long.compare(m1.getOrderIndex(), m2.getOrderIndex()));
        int completedCups = 0;
        int totalCups = 0;
        for(ModuleResponse moduleResponse : moduleResponses){
            completedCups += moduleResponse.getCompleteCups();
            totalCups += 3;
        }
        response.setCompletedCup(completedCups + "/" + totalCups);
        response.setModules(moduleResponses);

        return response;
    }

    @Override
    public boolean isCompleted(Integer courseId, Integer studentProfileId) {
        CourseEntity courseEntity = courseRepository.findById(courseId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        for(ModuleEntity moduleEntity : courseEntity.getModules()){
            if(!moduleService.isCompleted(moduleEntity.getId(), studentProfileId)){
                return false;
            }
        }
        return true;
    }
}
