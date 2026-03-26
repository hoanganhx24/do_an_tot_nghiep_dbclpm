package com.mxhieu.doantotnghiep.dto.request;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentprofileRequest {

    private Integer id;
    // Thông tin User
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String sex;           // Nam/Nữ/Khác
    private LocalDate birthday;   // Ngày sinh

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

    String otp;
}
