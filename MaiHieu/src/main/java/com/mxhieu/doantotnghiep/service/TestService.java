package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.TestRequest;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.TestEntity;

import java.util.List;

public interface TestService {
    void createTest(TestRequest testRequest);

    TestResponse getTestById(Integer id);

    void createFirstTest(TestRequest testRequest);

    List<TestResponse> getFirstTestsSummery();

    int commpletedStar(Integer testId, Integer studentProfileId);

    List<TestResponse> getTestResponseDetail(List<TestEntity> tests, Integer studentProfileId);

    int getCompletedTestsOfStudent(List<TestEntity> tests, Integer studentProfileId);

    List<Integer> getTestAttemptIds(Integer testId, Integer studentProfileId);

    TestResponse getMiniTestsSummery(Integer id);

    float getMaxScore(Integer testId, Integer studentProfileId);

    Boolean isLock(Integer id, Integer studentId);

    boolean isCompletedTest(Integer id, Integer studentProfileId);

    void deleteTest(Integer id);
}
