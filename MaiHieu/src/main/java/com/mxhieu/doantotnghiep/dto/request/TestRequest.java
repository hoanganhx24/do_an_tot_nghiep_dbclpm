package com.mxhieu.doantotnghiep.dto.request;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestRequest {
    private Integer id;
    private String type;
    private String name;
    private Integer moduleId;
}
