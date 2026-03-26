package com.mxhieu.doantotnghiep.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InformationOfStudyPlanResponse {
    Integer soNgayHocConLai;
    Integer soCupDaDat;
    Integer soUnitDat2Cup;
    Integer soUnitDaHoanThanh;
    Integer soUnitTheoKeHoach;
    Integer tongSoUnit;
    List<StudyPlanItemResponse> unitsCanHoanThanh;
}
