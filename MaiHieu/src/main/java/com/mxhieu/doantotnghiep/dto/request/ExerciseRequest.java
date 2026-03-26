package com.mxhieu.doantotnghiep.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseRequest {
    private Integer id;
    private String type;
    private String title;
    private int lessonID;
    private int orderIndex;
    private byte[] mediaData;
    private byte[] imageData;
    private List<String> paragraphs;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime showTime;
}
