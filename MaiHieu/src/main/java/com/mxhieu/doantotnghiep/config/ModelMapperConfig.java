package com.mxhieu.doantotnghiep.config;

import com.mxhieu.doantotnghiep.dto.response.TeacherprofileResponse;
import com.mxhieu.doantotnghiep.entity.TeacherprofileEntity;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        // Tạo object và cấu hình
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        modelMapper.typeMap(TeacherprofileEntity.class, TeacherprofileResponse.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getEmail(), TeacherprofileResponse::setEmail);
            mapper.map(src -> src.getUser().getFullName(), TeacherprofileResponse::setFullName);
            mapper.map(src -> src.getUser().getPhone(), TeacherprofileResponse::setPhone);
            mapper.map(src -> src.getUser().getAddress(), TeacherprofileResponse::setAddress);
            mapper.map(src -> src.getUser().getSex(), TeacherprofileResponse::setSex);
            mapper.map(src -> src.getUser().getBirthday(), TeacherprofileResponse::setBirthday);
        });
        return modelMapper;
    }
}

