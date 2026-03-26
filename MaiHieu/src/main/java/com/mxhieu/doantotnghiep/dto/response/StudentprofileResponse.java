package com.mxhieu.doantotnghiep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentprofileResponse {
    private Integer id;
    // Thông tin User
    UserRespone user;

    // Ngày tham gia (UI đang để dạng string)
    private String joinDate;

    // Mục tiêu điểm số
    private Integer targetScore;

    // Số phút học mỗi ngày
    private Integer dailyStudyMinutes;

    // Hạn mục tiêu (YYYY-MM-DD)
    private LocalDate goalDate;

    // Cấp độ hiện tại
    private String placementLevel;

    // Tiến độ học (%)
    private Integer progress;

    // Lần hoạt động cuối
    private LocalDateTime lastActiveAt;
}
