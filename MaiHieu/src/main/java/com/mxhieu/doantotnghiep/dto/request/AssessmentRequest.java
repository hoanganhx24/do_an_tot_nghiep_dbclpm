package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentRequest {
    private Integer id;
    private Integer version;
    private Integer isActive;
    private LocalDateTime createdAt;
    private String title;
    private String type;
    private Integer testId;
    private byte[] mediaData;
    private byte[] imageData;
    private List<String> paragraphs;
}
