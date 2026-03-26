package com.mxhieu.doantotnghiep.dto.request;

import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.checkerframework.checker.units.qual.A;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleRequest {
    private Integer id;
    private Integer studentProfileId;
    private Integer courseId;
    private String title;
    private String description;
    private Long orderIndex;
    private ModuleType type;
}
