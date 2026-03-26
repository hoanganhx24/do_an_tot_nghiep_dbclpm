package com.mxhieu.doantotnghiep.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyPlanResponse {
    private Integer id;
    private LocalDateTime generatedAt;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate startDate;
    private String configJson;
    private Integer status;
    private Integer studentProfileId;
    private Integer tongSoBuoiHoc;
    private List<Integer> ngayHocTrongTuan;
    private Integer tongSoUnits;
    private String soUnitsTrenBuoi;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate ngayHoanThanh;
    private Integer TrackId;
    List<StudyPlanItemResponse> studyPlanItems;
 }
