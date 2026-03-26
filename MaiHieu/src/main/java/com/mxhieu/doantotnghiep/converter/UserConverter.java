package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.UserRequest;
import com.mxhieu.doantotnghiep.dto.response.UserRespone;
import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.entity.UserEntity;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserConverter extends BaseConverter<UserEntity, UserRequest,UserRespone> {
    @Autowired
    ModelMapper modelMapper;

    public UserRespone toInForUser(UserEntity userEntity, List<RoleEntity> roles) {
        UserRespone result = modelMapper.map(userEntity, UserRespone.class);
        result.setRoles(roles.stream().map(roleEntity -> roleEntity.getValue()).toList());
        return result;
    }

}

