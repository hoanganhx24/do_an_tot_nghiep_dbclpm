package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentprofileResponse;

import java.util.List;

public interface StudentProfileService {
    void createStudentProfile(StudentprofileRequest request);
    List<StudentprofileResponse> getStudentProfiles();

    Object getStudentProfileById(int id);

    void updateStudentProfile(StudentprofileRequest request);

    void khoaTaiKhoanStudentProfile(int id);
}
