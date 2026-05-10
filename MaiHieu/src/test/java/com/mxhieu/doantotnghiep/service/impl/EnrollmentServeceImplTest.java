package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.EnrollmentRequest;
import com.mxhieu.doantotnghiep.dto.response.EnrollmentResponst;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test cho EnrollmentServeceImpl sử dụng MySQL.
 *
 * Nghiệp vụ: Đăng ký lộ trình học dựa trên điểm đầu vào (UC 2.3.1).
 * - Phân loại học sinh vào các Track tương ứng (0-300, 300-600, 600+).
 * - Mở khóa (UNLOCK) hoặc hoàn thành (DONE) các khóa học/bài học theo lộ trình.
 *
 * Liên kết System Test:
 * - HKH_FU_6: Chức năng unlock bài học.
 * - HKH_FU_7: Chức năng khóa bài học chưa đến lượt.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EnrollmentServeceImplTest {

    @Autowired
    private EnrollmentServeceImpl enrollmentService;
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    @Autowired
    private TrackRepository trackRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private TeacheprofileRepository teacheprofileRepository;
    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    // =========================================================================
    // MAIN TEST CASES
    // =========================================================================

    @Test
    @DisplayName("MAI-ENR-001: saveEnrollment - Điểm thấp (<30) chỉ mở khóa Track 1")
    void saveEnrollment_LowScore_ShouldUnlockTrack1() {
        // === DATA: Thiết lập 3 Track cơ bản và 1 học sinh mới ===
        setupMandatoryTracks();
        StudentProfileEntity student = createStudent();

        EnrollmentRequest request = EnrollmentRequest.builder()
                .studentProfileId(student.getId())
                .score(25f) // Điểm thấp
                .build();

        // === ACTION: Gọi service đăng ký lộ trình ===
        enrollmentService.saveEnrollment(request);

        // === CHECK DB: Kiểm tra bảng Enrollment và trạng thái các Track ===
        List<EnrollmentEntity> enrollments = enrollmentRepository.findByStudentProfile_Id(student.getId());
        assertEquals(3, enrollments.size(), "Học sinh phải được đăng ký vào cả 3 Track");

        // Track 0-300 phải được UNLOCK (status = 1) để học sinh bắt đầu học
        assertTrue(enrollments.stream().anyMatch(e -> e.getTrack().getCode().equals("0-300") && e.getStatus() == 1));
        // Track 300-600 phải bị LOCK (status = 0)
        assertTrue(enrollments.stream().anyMatch(e -> e.getTrack().getCode().equals("300-600") && e.getStatus() == 0));

        // === ROLLBACK: Tự động bởi @Transactional ===
    }

    @Test
    @DisplayName("MAI-ENR-002: saveEnrollment - Điểm trung bình (50) hoàn thành Track 1, mở Track 2")
    void saveEnrollment_MidScore_ShouldDoneT1UnlockT2() {
        // === DATA: Học sinh có điểm trung bình ===
        setupMandatoryTracks();
        StudentProfileEntity student = createStudent();

        EnrollmentRequest request = EnrollmentRequest.builder()
                .studentProfileId(student.getId())
                .score(50f) // 50 nằm trong khoảng [30, 60)
                .build();

        // === ACTION ===
        enrollmentService.saveEnrollment(request);

        // === CHECK DB ===
        List<EnrollmentEntity> enrollments = enrollmentRepository.findByStudentProfile_Id(student.getId());

        // Theo nghiệp vụ: Điểm này đạt yêu cầu Track 1 nên Track 1 phải là DONE (status
        // = 2)
        assertTrue(enrollments.stream().anyMatch(e -> e.getTrack().getCode().equals("0-300") && e.getStatus() == 2));
        // Track 2 (300-600) sẽ được UNLOCK (status = 1) để học sinh học tiếp
        assertTrue(enrollments.stream().anyMatch(e -> e.getTrack().getCode().equals("300-600") && e.getStatus() == 1));
    }

    @Test
    @DisplayName("MAI-ENR-003: getStudentEnrollmenteds - Trả về đúng 3 lộ trình cố định")
    void getStudentEnrollmenteds_ShouldReturnThreeTracks() {
        /**
         * MỤC ĐÍCH: Kiểm tra API lấy danh sách lộ trình của học sinh.
         * NGHIỆP VỤ: Mỗi học sinh sau khi đăng ký đều phải có đủ 3 chặng (0-300,
         * 300-600, 600+).
         */
        setupMandatoryTracks();
        StudentProfileEntity student = createStudent();

        enrollmentService.saveEnrollment(EnrollmentRequest.builder()
                .studentProfileId(student.getId()).score(10f).build());

        // === ACTION ===
        List<EnrollmentResponst> result = enrollmentService.getStudentEnrollmenteds(student.getId());

        // === CHECK ===
        assertNotNull(result);
        assertEquals(3, result.size(), "Hệ thống luôn đăng ký đủ 3 track cho học sinh (0-300, 300-600, 600+)");
        assertTrue(result.stream().anyMatch(r -> r.getTrackResponse().getCode().equals("0-300")));
        assertTrue(result.stream().anyMatch(r -> r.getTrackResponse().getCode().equals("300-600")));
        assertTrue(result.stream().anyMatch(r -> r.getTrackResponse().getCode().equals("600+")));
    }

    @Test
    @DisplayName("MAI-ENR-004: saveEnrollment - Lỗi khi học sinh không tồn tại")
    void saveEnrollment_StudentNotFound_ShouldThrow() {
        // === DATA ===
        setupMandatoryTracks();
        EnrollmentRequest request = EnrollmentRequest.builder()
                .studentProfileId(9999) // ID không tồn tại
                .score(10f)
                .build();

        // === ACTION & CHECK ===
        AppException ex = assertThrows(AppException.class, () -> enrollmentService.saveEnrollment(request));
        assertEquals(ErrorCode.STUDENT_PROFILE_NOT_FOUND, ex.getErrorCode());
    }

    // =========================================================================
    // HELPER METHODS (Dùng để làm sạch code và giữ dữ liệu mồi ổn định)
    // =========================================================================

    private void setupMandatoryTracks() {
        String[] codes = { "0-300", "300-600", "600+" };
        for (String code : codes) {
            if (trackRepository.findByCode(code).isEmpty()) {
                TrackEntity track = new TrackEntity();
                track.setCode(code);
                track.setName("Track " + code);
                trackRepository.saveAndFlush(track);
            }
        }
    }

    private StudentProfileEntity createStudent() {
        UserEntity user = new UserEntity();
        user.setEmail("std_" + System.currentTimeMillis() + "@test.com");
        user.setStatus("ACTIVE");
        user = userRepository.saveAndFlush(user);

        StudentProfileEntity student = new StudentProfileEntity();
        student.setUser(user);
        return studentProfileRepository.saveAndFlush(student);
    }
}
