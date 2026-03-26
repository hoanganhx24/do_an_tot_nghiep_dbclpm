package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.StudentDictionaryRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentDictionaryResponse;

public interface StudentDictionaryService {
    void save(StudentDictionaryRequest studentDictionaryRequest);

    StudentDictionaryResponse getAllForStudent(Integer studentID);
}
