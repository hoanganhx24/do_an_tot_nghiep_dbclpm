package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;

import java.util.List;

public interface TeacherprofileService {
    void checkEmailExists(String email);
    void createTeacherProfile(TeacherprofileRequest request);

    List<TeacherprofileResponse> getAllTeacherProfiles();
    List<TeacherprofileResponse> getAllTeacherProfilesActive();

    TeacherprofileResponse getTeacherProfileByID(Integer id);

    void terminateTeacherProfile(Integer id);

    void updateTeacher(TeacherprofileRequest request);
}
