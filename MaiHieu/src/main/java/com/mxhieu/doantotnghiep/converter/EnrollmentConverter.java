package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.EnrollmentRequest;
import com.mxhieu.doantotnghiep.dto.response.EnrollmentResponst;
import com.mxhieu.doantotnghiep.dto.response.TrackResponse;
import com.mxhieu.doantotnghiep.entity.EnrollmentEntity;
import com.mxhieu.doantotnghiep.entity.TrackEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EnrollmentConverter extends BaseConverter<EnrollmentEntity, EnrollmentRequest, EnrollmentResponst> {
    public List<EnrollmentResponst> toStudyFlow(List<EnrollmentEntity> enrollmentEntities) {
        List<EnrollmentResponst> enrollmentResponsts = new ArrayList<>();
        enrollmentEntities.forEach(enrollmentEntity -> {
            TrackEntity trackEntity = enrollmentEntity.getTrack();
            EnrollmentResponst responst= EnrollmentResponst.builder()
                    .status(enrollmentEntity.getStatus())
                    .trackResponse(TrackResponse.builder()
                            .code(trackEntity.getCode())
                            .description(trackEntity.getDescription())
                            .build())
                    .build();
            enrollmentResponsts.add(responst);
        });
        return enrollmentResponsts;
    }

    public EnrollmentResponst toResponseSummary(EnrollmentEntity enrollmentEntity) {
        return EnrollmentResponst.builder()
                .id(enrollmentEntity.getId())
                .studentProfileId(enrollmentEntity.getStudentProfile().getId())
                .status(enrollmentEntity.getStatus())
                .build();
    }
}
