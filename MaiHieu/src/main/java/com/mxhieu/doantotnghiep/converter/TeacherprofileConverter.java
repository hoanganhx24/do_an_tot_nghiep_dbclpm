package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.TeacherprofileRequest;
import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import org.checkerframework.checker.units.qual.A;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class TeacherprofileConverter extends BaseConverter<TeacherprofileEntity, TeacherprofileRequest, TeacherprofileResponse> {
    @Override
    public TeacherprofileResponse toResponse(TeacherprofileEntity entity, Class<TeacherprofileResponse> responseClass) {
        TeacherprofileResponse res = modelMapper.map(entity, responseClass);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        if (entity.getUser() != null) {
            res.setEmail(entity.getUser().getEmail());
            res.setFullName(entity.getUser().getFullName());
            res.setPhone(entity.getUser().getPhone());
            res.setAddress(entity.getUser().getAddress());
            res.setSex(entity.getUser().getSex());
            if(entity.getUser().getBirthday() != null)
                res.setBirthday(entity.getUser().getBirthday().format(dtf));
            res.setStatus(entity.getUser().getStatus());
        }

        return res;
    }
}
