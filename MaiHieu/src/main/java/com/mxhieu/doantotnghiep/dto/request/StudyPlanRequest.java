package com.mxhieu.doantotnghiep.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlanRequest {
    private Integer id;
    private LocalDateTime generatedAt;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate startDate;
    private String configJson;
    private Integer status;
    private Integer studentProfileId;
    private Integer soLuongNgayHoc;
    private List<Integer> ngayHocTrongTuan;
    private Integer trackId;
}
