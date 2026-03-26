package com.mxhieu.doantotnghiep.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DataMailDTO {
    private String to;                        // Địa chỉ email người nhận
    private String subject;                   // Tiêu đề email
    private String content;                   // Nội dung (nếu gửi mail text)
    private Map<String, Object> props;         // Dữ liệu động dùng trong template Thymeleaf
}
