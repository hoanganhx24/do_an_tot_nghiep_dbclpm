package com.mxhieu.doantotnghiep.dto.response;

import lombok.*;
import org.eclipse.angus.mail.util.DefaultProvider;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlanOverViewResponse {
    private Integer trackId;
    private String trackName;
    private String trackDescription;
    private String overview;
    private String mucTieuDauRa;
    private String thoiGianHocTieuChuan;
}
