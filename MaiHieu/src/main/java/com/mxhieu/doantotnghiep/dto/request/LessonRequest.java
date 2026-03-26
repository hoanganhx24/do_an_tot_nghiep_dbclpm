package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LessonRequest {
    private Integer id;
    private Integer moduleId;
    private String title;
    private String summary;
    private Integer durationMinutes;
    private Integer orderIndex;
    private Integer gatingRules;

    private String videoPath;
    private List<MultipartFile> materials;
}
