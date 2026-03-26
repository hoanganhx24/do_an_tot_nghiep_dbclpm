package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonProgressRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.LessonOrTestAroundResponse;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LessonService {
    void createLesson(LessonRequest lessonRequest, String videoPath, List<MultipartFile> materials);
    int getMaxOrder(Integer moduleId);
    List<LessonResponse> getLessons(Integer moduleId);
    int completedStar(Integer lessonId, Integer studentProfileId);
    List<LessonResponse> getLessons(Integer moduleId, Integer studentProfileId);
    List<LessonResponse> getListLessonResponseDetail(List<LessonEntity> lessonEntities, Integer studentProfileId);
    LessonResponse getLesson(Integer id);
    Boolean isCompletedLesson(Integer lessonId, Integer studentProfileId);

    Boolean isLockLesson(Integer lessonId, Integer studentProfileId);

    String getLessonPath(Integer lessonId);

    LessonOrTestAroundResponse getNextLessonOrTest(LessonOrTestAroundRequest request);

    LessonOrTestAroundResponse getPreviousLessonID(LessonOrTestAroundRequest request);

    void updateLesson(LessonRequest lessonRequest);

    void deleteLesson(Integer id);

    LessonResponse getLessonForStudent(Integer id, Integer studentId);
}
