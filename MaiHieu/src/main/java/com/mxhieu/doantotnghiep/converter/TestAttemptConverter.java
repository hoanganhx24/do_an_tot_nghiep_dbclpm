package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.TestAttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.TestAttemptResponse;
import com.mxhieu.doantotnghiep.entity.TestAttemptEntity;
import org.springframework.stereotype.Component;

@Component
public class TestAttemptConverter extends BaseConverter<TestAttemptEntity, TestAttemptRequest, TestAttemptResponse> {
    public TestAttemptResponse toResponseSummery(TestAttemptEntity testAttemptEntity) {
        TestAttemptResponse response = TestAttemptResponse.builder()
                .id(testAttemptEntity.getId())
                .totalScore(testAttemptEntity.getTotalScore())
                .count(testAttemptEntity.getCount())
                .testAt(testAttemptEntity.getTestAt())
                .studentProfileId(testAttemptEntity.getStudentProfile().getId())
                .build();
        return response;
    }
}
