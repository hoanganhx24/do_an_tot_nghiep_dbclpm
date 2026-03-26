package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.StudyPlanRequest;
import com.mxhieu.doantotnghiep.dto.response.StudyPlanResponse;
import com.mxhieu.doantotnghiep.entity.StudyPlanEntity;
import org.springframework.stereotype.Component;

@Component
public class StudyPlanConverter extends BaseConverter<StudyPlanEntity, StudyPlanRequest, StudyPlanResponse> {
    public StudyPlanResponse toResponseSummery(StudyPlanEntity studyPlanEntity) {
        StudyPlanResponse response = StudyPlanResponse.builder()
                .id(studyPlanEntity.getId())
                .status(studyPlanEntity.getStatus())
                .generatedAt(studyPlanEntity.getGeneratedAt())
                .startDate(studyPlanEntity.getStartDate())
                .ngayHocTrongTuan(studyPlanEntity.getNgayHocTrongTuan())
                .build();
        return response;
    }
}
