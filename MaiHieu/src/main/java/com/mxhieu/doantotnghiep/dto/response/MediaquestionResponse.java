package com.mxhieu.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaquestionResponse {
    private Integer id;
    private String skill;
    private String type;
    private String section;
    private String audioUrl;
    private String imageUrl;
    private String scirpt;
    private byte[] mediaData;
}
