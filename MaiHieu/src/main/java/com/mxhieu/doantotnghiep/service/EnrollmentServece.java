package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.EnrollmentRequest;
import com.mxhieu.doantotnghiep.dto.response.EnrollmentResponst;

import java.util.List;

public interface EnrollmentServece {
    public void saveEnrollment(EnrollmentRequest enrollmentRequest);

    List<EnrollmentResponst> getStudentEnrollmenteds(Integer studenId);

    List<EnrollmentResponst> getPreviewStudyFlow(Integer studentId);
}
