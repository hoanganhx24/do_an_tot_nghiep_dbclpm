package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.StudentprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.StudentprofileResponse;
import com.mxhieu.doantotnghiep.entity.StudentProfileEntity;
import org.springframework.stereotype.Component;

@Component
public class StudentProfileConverter extends BaseConverter<StudentProfileEntity, StudentprofileRequest, StudentprofileResponse> {
}
