package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.AssessmentRequest;
import com.mxhieu.doantotnghiep.dto.response.AssessmentResponse;

import java.util.List;

public interface AssessmentService {
    void createAssessment(AssessmentRequest assessmentRequest);
    List<AssessmentResponse> getSummaryAssessmentsByTestId(Integer testId);

    AssessmentResponse getAssessmentDetailById(Integer id);

    void deleteAssessmentById(Integer id);

    List<AssessmentResponse> getAssessmentDetailForFistTest();
    List<AssessmentResponse> getAssessmentsDetailByTestId(int testId);

    void updateAssessment(AssessmentRequest assessmentRequest);
}
