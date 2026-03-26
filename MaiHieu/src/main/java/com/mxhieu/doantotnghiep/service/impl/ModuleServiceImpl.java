package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.LessonConverter;
import com.mxhieu.doantotnghiep.converter.ModuleConverter;
import com.mxhieu.doantotnghiep.dto.request.ModuleRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.LessonRepository;
import com.mxhieu.doantotnghiep.repository.ModuleRepository;
import com.mxhieu.doantotnghiep.repository.TestRepository;
import com.mxhieu.doantotnghiep.service.LessonService;
import com.mxhieu.doantotnghiep.service.ModuleService;
import com.mxhieu.doantotnghiep.service.TestService;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ModuleServiceImpl implements ModuleService {
    private final ModuleRepository moduleRepository;
    private final ModuleConverter moduleConverter;
    private final LessonService lessonService;
    private final LessonRepository lessonRepository;
    private final LessonConverter lessonConverter;
    private final TestRepository testRepository;
    private final TestService testService;

    @Override
    public void addModule(ModuleRequest request) {
        ModuleEntity module = moduleConverter.toEntity(request,ModuleEntity.class);
        if(module.getOrderIndex() <= getMaxOrder(request.getCourseId())){
            moduleRepository.flushOrderIndex(request.getCourseId(), request.getOrderIndex());
        }
        moduleRepository.save(module);
    }

    @Override
    public List<ModuleResponse> getAll() {
        List<ModuleEntity> moduleEntities = moduleRepository.findAll();
        return moduleEntities.stream()
                .map(module -> moduleConverter.toResponse(module, ModuleResponse.class))
                .toList();
    }

    @Override
    public Long getMaxOrder(Integer courseId) {
        Long maxOrder = moduleRepository.getMaxOrder(courseId) + 1;
        return maxOrder;
    }
    @Override
    public int completedCups(Integer moduleId, Integer studentProfileId) {
        List<LessonEntity> lessonEntities = lessonRepository.findByModuleId(moduleId);
        List<TestEntity> testEntities = testRepository.findByModuleId(moduleId);
        int compleatedCups= 0;
        for (LessonEntity lessonEntity : lessonEntities) {
            compleatedCups += lessonService.completedStar(lessonEntity.getId(), studentProfileId);
        }

        for (TestEntity testEntity : testEntities) {
            compleatedCups += testService.commpletedStar(testEntity.getId(), studentProfileId);
        }
        float phanTram = (float) compleatedCups / (lessonEntities.size() * 3 + testEntities.size() * 3) * 100;

        int cups = 0;
        if(phanTram == 100) {
            cups = 3;
        } else if(phanTram >= 50) {
            cups = 2;
        } else if(phanTram > 0) {
            cups = 1;
        }
        return cups;
    }

    @Override
    public List<ModuleResponse> getResponseDetailList(List<ModuleEntity> moduleEntities, Integer studentProfileId) {
        List<ModuleResponse> moduleResponseList = new ArrayList<>();
        for(ModuleEntity moduleEntity : moduleEntities) {
            ModuleResponse moduleResponse = moduleConverter.toResponseForStudent(moduleEntity);
            moduleResponse.setType(moduleEntity.getType());
            moduleResponse.setOrderIndex(moduleEntity.getOrderIndex());
            if(moduleEntity.getType() == ModuleType.TEST){
                moduleResponse.setTests(testService.getTestResponseDetail(moduleEntity.getTests(), studentProfileId));
                moduleResponse.setTotalLessons(testRepository.countByModuleId(moduleEntity.getId()));
                moduleResponse.setTotalStar(moduleResponse.getTotalLessons() *  3);
                moduleResponse.setCompletedLessons(testService.getCompletedTestsOfStudent(moduleEntity.getTests(), studentProfileId));
                Long completedStars = 0L;
                for (TestResponse test : moduleResponse.getTests()) {
                    completedStars += test.getCompletedStar();
                }
                moduleResponse.setCompletedStars(completedStars);
            }else{
                moduleResponse.setTotalLessons(lessonRepository.countByModuleId(moduleEntity.getId()));
                moduleResponse.setLessons(lessonService.getListLessonResponseDetail(moduleEntity.getLessons(), studentProfileId));
                Collections.sort(moduleResponse.getLessons(), (l1, l2) -> Integer.compare(l1.getOrderIndex(), l2.getOrderIndex()));
                moduleResponse.setTotalStar(moduleResponse.getTotalLessons() *  3);
                moduleResponse.setCompletedLessons(countCompletedLessonsOfStudent(moduleEntity.getLessons(), studentProfileId));
                Long completedStars = 0L;
                for (LessonResponse lesson : moduleResponse.getLessons()) {
                    completedStars += lesson.getCompletedStar();
                }
                 moduleResponse.setCompletedStars(completedStars);
            }
            moduleResponse.setCompleteCups(completedCups(moduleEntity.getId(), studentProfileId));
            moduleResponseList.add(moduleResponse);
        }
        return moduleResponseList;
    }

    private int countCompletedLessonsOfStudent(List<LessonEntity> lessons, Integer studentProfileId) {
        int count = 0;
        for (LessonEntity lesson : lessons) {
            if(lessonService.isCompletedLesson(lesson.getId(), studentProfileId)) {
                count++;
            }
        }
        return count;
    }

    @Override
    public List<ModuleResponse> getAllModulesOfCourse(int courseId) {
        List<ModuleEntity> moduleEntities = moduleRepository.findByCourseIdOrderByOrderIndex(courseId);
        List<ModuleResponse> moduleResponseList = new ArrayList<>();
        for(ModuleEntity moduleEntity : moduleEntities) {
            ModuleResponse moduleResponse = moduleConverter.toResponseByTeacherOrAdmin(moduleEntity);
            moduleResponse.setLessons(lessonConverter.toResponseByTeacherOrAdmin(moduleEntity.getLessons()));
            moduleResponseList.add(moduleResponse);
        }
        return moduleResponseList;
    }

    @Transactional
    @Override
    public void updateModule(ModuleRequest request) {
        ModuleEntity moduleEntity = moduleRepository.findById(request.getId()).orElseThrow(() -> new AppException(ErrorCode.MODULE_NOT_FOUND));
        Long newIndext = request.getOrderIndex();
        Long oldIndext = moduleEntity.getOrderIndex();
        Integer courseId = moduleEntity.getCourse().getId();

        moduleRepository.decreaseOrderIndex(courseId, oldIndext);
        Long maxIndex = getMaxOrder(courseId);


        moduleEntity.setTitle(request.getTitle());
        if (newIndext < maxIndex) {
            moduleRepository.flushOrderIndex(courseId, request.getOrderIndex());
        }else{
            newIndext = maxIndex;
        }
        moduleEntity.setOrderIndex(newIndext);
        moduleRepository.save(moduleEntity);
    }

    @Override
    public void deleteModule(Integer id) {
        ModuleEntity moduleEntity = moduleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MODULE_NOT_FOUND));
        Long index = moduleEntity.getOrderIndex();
        Integer courseId = moduleEntity.getCourse().getId();

        moduleRepository.decreaseOrderIndex(courseId, index);

        moduleRepository.deleteById(id);
    }

    @Override
    public boolean isCompleted(Integer moduleId, Integer studentId) {
        ModuleEntity moduleEntity = moduleRepository.findById(moduleId).orElseThrow(() -> new AppException(ErrorCode.MODULE_NOT_FOUND));
        if(moduleEntity.getType() == ModuleType.LESSON){
            for(LessonEntity lesson : moduleEntity.getLessons()){
                if(!lessonService.isCompletedLesson(lesson.getId(), studentId)) {
                    return false;
                }
            }
        }else {
            for (TestEntity testEntity : moduleEntity.getTests()){
                if(!testService.isCompletedTest(testEntity.getId(), studentId)) {
                    return false;
                }
            }
        }
        return true;
    }


}
