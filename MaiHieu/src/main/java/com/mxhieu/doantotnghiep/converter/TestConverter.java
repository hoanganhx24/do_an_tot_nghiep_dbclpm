package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.TestRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.dto.response.TestResponse;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import com.mxhieu.doantotnghiep.entity.TestEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@RequiredArgsConstructor
@Component
public class TestConverter extends BaseConverter<TestEntity, TestRequest, TestResponse> {
    public List<TestResponse> toResponseByTeacherOrAdmin(List<TestEntity> tests) {
        List<TestResponse> responses = new ArrayList<>();
        for (TestEntity test : tests) {
            TestResponse response = TestResponse.builder()
                    .id(test.getId())
                    .name(test.getName())
                    .type(test.getType())
                    .build();
            responses.add(response);
        }
        return responses;
    }

    public TestResponse toResponseSummery(TestEntity testEntity) {
        return TestResponse.builder()
                .id(testEntity.getId())
                .type(testEntity.getType())
                .name(testEntity.getName())
                .build();
    }

    public TestResponse toResponseNoQuestion(TestEntity testEntity) {
        return TestResponse.builder()
                .id(testEntity.getId())
                .type(testEntity.getType())
                .name(testEntity.getName())
                .build();
    }
}
