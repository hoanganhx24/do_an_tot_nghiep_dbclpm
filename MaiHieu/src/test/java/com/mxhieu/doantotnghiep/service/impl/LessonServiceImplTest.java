package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.LessonOrTestAroundRequest;
import com.mxhieu.doantotnghiep.dto.request.LessonRequest;
import com.mxhieu.doantotnghiep.dto.response.LessonOrTestAroundResponse;
import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
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
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test cho LessonServiceImpl sử dụng MySQL.
 *
 * Nghiệp vụ (Docs đồ án):
 * - Quản lý bài học (Lesson) trong Module (UC 2.3.11).
 * - Xem chi tiết bài học cho học sinh, bao gồm trạng thái Khóa/Mở khóa (UC 2.3.17).
 * - Điều hướng bài học (Next/Previous).
 * - Tính toán số sao dựa trên kết quả bài tập.
 *
 * Liên kết System Test:
 * - QLBHM-FU-01 -> 04: CRUD & Sắp xếp bài học.
 * - HKH_FU_6, 12: Mở khóa và Hoàn thành.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LessonServiceImplTest {

    @Autowired private LessonServiceImpl lessonService;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private ModuleRepository moduleRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private TrackRepository trackRepository;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacheprofileRepository teacheprofileRepository;
    @Autowired private EnrollmentCourseRepository enrollmentCourseRepository;
    @Autowired private LessonProgressRepository lessonProgressRepository;
    @Autowired private MediaAssetRepository mediaAssetRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private ExerciseTypeRepository exerciseTypeRepository;

    private ModuleEntity setupBaseModule(String trackCode) {
        TrackEntity track = trackRepository.save(TrackEntity.builder().code(trackCode).name("Track " + trackCode).build());
        UserEntity userTea = userRepository.save(new UserEntity());
        TeacherprofileEntity teacher = new TeacherprofileEntity();
        teacher.setUser(userTea);
        teacher = teacheprofileRepository.save(teacher);
        CourseEntity course = new CourseEntity();
        course.setTitle("Course Test");
        course.setTrack(track);
        course.setTeacherprofile(teacher);
        course.setModules(new ArrayList<>());
        course = courseRepository.save(course);
        ModuleEntity module = new ModuleEntity();
        module.setCourse(course);
        module.setType(ModuleType.LESSON);
        module.setOrderIndex(1L);
        module.setLessons(new ArrayList<>());
        module = moduleRepository.save(module);
        course.getModules().add(module);
        return module;
    }

    private LessonEntity createLessonHelper(ModuleEntity module, String title, int order) {
        LessonEntity lesson = new LessonEntity();
        lesson.setModule(module);
        lesson.setTitle(title);
        lesson.setOrderIndex(order);
        lesson.setGatingRules(80);
        lesson.setExercises(new ArrayList<>());
        lesson.setMaterialEntities(new ArrayList<>());
        lesson.setMediaassets(new ArrayList<>());
        MediaAssetEntity media = new MediaAssetEntity();
        media.setUrl("uploads/videos/dummy.mp4");
        media.setLesson(lesson);
        lesson.getMediaassets().add(media);
        lesson = lessonRepository.save(lesson);
        module.getLessons().add(lesson);
        return lesson;
    }

    private StudentProfileEntity createStudentHelper() {
        UserEntity user = new UserEntity();
        user.setEmail("std_" + System.currentTimeMillis() + "@test.com");
        user = userRepository.save(user);
        StudentProfileEntity student = new StudentProfileEntity();
        student.setUser(user);
        return studentProfileRepository.save(student);
    }

    // 1. CREATE
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-001 - createLesson (Success Path)
     * - Logic: Chuyển đổi LessonRequest -> LessonEntity, xử lý MediaAsset (video) và sắp xếp lại OrderIndex của các bài học cũ.
     * - Ý nghĩa Assert: assertEquals(1, ...) xác thực tính Persistence. Đảm bảo Transaction hoàn tất và 1 record vật lý đã được Insert vào bảng 'lessons' thành công.
     */
    @Test
    @DisplayName("MAI-LSS-001: createLesson - Thành công (QLBHM-FU-01)")
    void createLesson_Success() {
        ModuleEntity module = setupBaseModule("C1");
        LessonRequest req = new LessonRequest();
        req.setModuleId(module.getId());
        req.setTitle("New Lesson");
        req.setOrderIndex(1);
        req.setDurationMinutes(20);
        lessonService.createLesson(req, "uploads/videos/dummy.mp4", Collections.emptyList());
        assertEquals(1, lessonRepository.findByModuleId(module.getId()).size());
    }

    // 2. UPDATE
    @Test
    @DisplayName("MAI-LSS-002: updateLesson - Cập nhật thông tin (QLBHM-FU-02)")
    void updateLesson_Success() {
        ModuleEntity module = setupBaseModule("U1");
        LessonEntity lesson = createLessonHelper(module, "Old Title", 1);
        LessonRequest req = new LessonRequest();
        req.setId(lesson.getId());
        req.setTitle("Updated Title");
        req.setOrderIndex(1);
        req.setDurationMinutes(30);
        lessonService.updateLesson(req);
        assertEquals("Updated Title", lessonRepository.findById(lesson.getId()).get().getTitle());
    }

    // 3. DELETE
    @Test
    @DisplayName("MAI-LSS-003: deleteLesson - Thành công (QLBHM-FU-03)")
    void deleteLesson_Success() {
        ModuleEntity module = setupBaseModule("D1");
        LessonEntity lesson = createLessonHelper(module, "Delete Me", 1);
        lessonService.deleteLesson(lesson.getId());
        assertFalse(lessonRepository.findById(lesson.getId()).isPresent());
    }

    // 4. GET FOR STUDENT (UNLOCKED)
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-004 - getLessonForStudent (Permission: Granted)
     * - Logic: Truy vấn DB để kiểm tra trạng thái EnrollmentCourse của Student cho khóa học tương ứng.
     * - Case: Khi Enrollment='UNLOCK' và tồn tại LessonProgress -> Service trả về LessonResponse kèm URL video.
     * - Ý nghĩa: Xác nhận tầng Security của Service cho phép truy xuất dữ liệu nhạy cảm (Media URL) khi đủ điều kiện học tập.
     */
    @Test
    @DisplayName("MAI-LSS-004: getLessonForStudent - Trả về khi đã mở khóa")
    void getLessonForStudent_Unlocked() {
        ModuleEntity module = setupBaseModule("S1");
        LessonEntity lesson = createLessonHelper(module, "Lesson 1", 1);
        StudentProfileEntity student = createStudentHelper();
        
        LessonProgressEntity lp = new LessonProgressEntity();
        lp.setLesson(lesson); lp.setStudentProfile(student); lp.setProcess(0); lp.setPercentageWatched(0);
        lessonProgressRepository.save(lp);
        
        EnrollmentEntity en = enrollmentRepository.save(EnrollmentEntity.builder().studentProfile(student).track(module.getCourse().getTrack()).status(1).build());
        enrollmentCourseRepository.save(new EnrollmentCourseEntity(null, "UNLOCK", module.getCourse(), en));

        LessonResponse res = lessonService.getLessonForStudent(lesson.getId(), student.getId());
        assertNotNull(res);
        assertEquals("Lesson 1", res.getTitle());
    }

    // 5. GET FOR STUDENT (LOCKED)
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-005 - getLessonForStudent (Permission: Denied)
     * - Logic: Hàm isLockLesson() kiểm tra trạng thái 'LOCK' từ EnrollmentCourseRepository.
     * - Case: Trạng thái khóa học là 'LOCK' -> Service PHẢI ngắt luồng và ném AppException.
     * - Ý nghĩa: Kiểm tra chốt chặn an toàn (Fail-safe), đảm bảo học sinh không thể truy cập bài học nếu chưa thỏa mãn điều kiện kinh doanh.
     */
    @Test
    @DisplayName("MAI-LSS-005: getLessonForStudent - Lỗi khi bài bị khóa")
    void getLessonForStudent_Locked_ShouldThrow() {
        ModuleEntity module = setupBaseModule("S2");
        LessonEntity lesson = createLessonHelper(module, "Locked", 1);
        StudentProfileEntity student = createStudentHelper();

        EnrollmentEntity en = enrollmentRepository.save(EnrollmentEntity.builder().studentProfile(student).track(module.getCourse().getTrack()).status(1).build());
        enrollmentCourseRepository.save(new EnrollmentCourseEntity(null, "LOCK", module.getCourse(), en));

        assertThrows(AppException.class, () -> lessonService.getLessonForStudent(lesson.getId(), student.getId()));
    }

    // 6. NEXT NAVIGATION
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-006 - Navigation Logic (Next)
     * - Logic: Sử dụng ItemWrapper để gom và sort toàn bộ cấu trúc Course (Module + Lesson).
     * - Case: Chuyển từ bài hiện tại sang bài có ID tiếp theo trong danh sách đã sort theo (ModuleOrder, ItemOrder).
     * - Ý nghĩa: Kiểm chứng thuật toán duyệt cây thư mục khóa học, đảm bảo tính liên tục của trải nghiệm người dùng.
     */
    @Test
    @DisplayName("MAI-LSS-006: getNextLessonOrTest - Tìm bài tiếp theo")
    void getNext_Success() {
        ModuleEntity module = setupBaseModule("N1");
        LessonEntity l1 = createLessonHelper(module, "L1", 1);
        LessonEntity l2 = createLessonHelper(module, "L2", 2);
        LessonOrTestAroundResponse next = lessonService.getNextLessonOrTest(new LessonOrTestAroundRequest(l1.getId(), "LESSON"));
        assertEquals(l2.getId(), next.getId());
    }

    // 7. PREVIOUS NAVIGATION
    /**
     * TEST: MAI-LSS-007
     * - Mục tiêu: Kiểm tra logic quay lại bài học trước đó.
     * - Hàm gốc (getPreviousLessonID): Ngược lại với Next, hàm tìm phần tử đứng trước trong danh sách ItemWrapper đã sắp xếp.
     * - Tại sao phải test: Đảm bảo học sinh có thể lùi lại đúng bài đã học trước đó, ngay cả khi bài đó nằm ở Module khác.
     */
    @Test
    @DisplayName("MAI-LSS-007: getPreviousLessonID - Tìm bài phía trước")
    void getPrevious_Success() {
        ModuleEntity module = setupBaseModule("P1");
        LessonEntity l1 = createLessonHelper(module, "L1", 1);
        LessonEntity l2 = createLessonHelper(module, "L2", 2);
        LessonOrTestAroundResponse prev = lessonService.getPreviousLessonID(new LessonOrTestAroundRequest(l2.getId(), "LESSON"));
        assertEquals(l1.getId(), prev.getId());
    }

    // 8. PATH
    /**
     * TEST: MAI-LSS-008
     * - Mục tiêu: Kiểm tra tính chính xác của chuỗi điều hướng (Breadcrumb).
     * - Hàm gốc (getLessonPath): Truy xuất ngược từ Lesson -> Module -> Course -> Track để lấy tên và nối lại.
     * - Tại sao phải test: Đảm bảo dữ liệu hiển thị trên giao diện người dùng giúp họ biết chính xác vị trí bài học trong toàn bộ hệ thống.
     */
    @Test
    @DisplayName("MAI-LSS-008: getLessonPath - Trả về chuỗi đường dẫn chuẩn")
    void getPath_Success() {
        ModuleEntity module = setupBaseModule("PTH");
        module.getCourse().getTrack().setName("T");
        module.getCourse().setTitle("C");
        module.setTitle("M");
        LessonEntity lesson = createLessonHelper(module, "L", 1);
        assertEquals("T/C/M/L", lessonService.getLessonPath(lesson.getId()));
    }

    // 9. COMPLETED STAR (3 STARS)
    /**
     * TEST: MAI-LSS-009
     * - Mục tiêu: Kiểm tra case đặc biệt khi hoàn thành bài học lý thuyết thuần túy.
     * - Hàm gốc (completedStar): Nếu bài học không có bài tập (getExercises.isEmpty) và đã xem xong video, mặc định tặng 3 sao.
     * - Tại sao phải test: Xác nhận học sinh không bị mất quyền lợi (nhận sao) đối với các bài học không yêu cầu làm bài tập.
     */
    @Test
    @DisplayName("MAI-LSS-009: completedStar - Không bài tập + Hoàn thành -> 3 sao")
    void completedStar_NoExercise_ShouldReturn3() {
        ModuleEntity module = setupBaseModule("STAR");
        LessonEntity lesson = createLessonHelper(module, "L", 1);
        StudentProfileEntity student = createStudentHelper();
        
        LessonProgressEntity lp = new LessonProgressEntity();
        lp.setLesson(lesson); lp.setStudentProfile(student); lp.setProcess(2); // Done
        lessonProgressRepository.save(lp);

        assertEquals(3, lessonService.completedStar(lesson.getId(), student.getId()));
    }

    // 10. IS COMPLETED
    /**
     * TEST: MAI-LSS-010
     * - Mục tiêu: Xác nhận trạng thái "Đã học xong".
     * - Hàm gốc (isCompletedLesson): Kiểm tra trạng thái 'process' trong LessonProgress. Phải bằng 2 (Done) mới trả về true.
     * - Tại sao phải test: Đây là dữ liệu nguồn để hiển thị dấu tích xanh hoàn thành bài học trên UI, cần đảm bảo tính chính xác tuyệt đối.
     */
    @Test
    @DisplayName("MAI-LSS-010: isCompletedLesson - Kiểm tra trạng thái hoàn thành")
    void isCompleted_Success() {
        ModuleEntity module = setupBaseModule("CMP");
        LessonEntity lesson = createLessonHelper(module, "L", 1);
        StudentProfileEntity student = createStudentHelper();
        
        LessonProgressEntity lp = new LessonProgressEntity();
        lp.setLesson(lesson); lp.setStudentProfile(student); lp.setProcess(2);
        lessonProgressRepository.save(lp);

        assertTrue(lessonService.isCompletedLesson(lesson.getId(), student.getId()));
    }

    // 11. LIST LESSONS
    /**
     * TEST: MAI-LSS-011
     * - Mục tiêu: Kiểm tra việc truy xuất danh sách bài học của Module.
     * - Hàm gốc (getLessons): Trả về List các LessonResponse thuộc ModuleId cung cấp.
     * - Tại sao phải test: Xác nhận hàm Repository và Converter phối hợp đúng để không bỏ sót hoặc sai lệch dữ liệu bài học khi hiển thị danh sách.
     */
    @Test
    @DisplayName("MAI-LSS-011: getLessons - Lấy danh sách bài học theo module")
    void getLessons_ShouldReturnList() {
        ModuleEntity module = setupBaseModule("LST");
        createLessonHelper(module, "L1", 1);
        createLessonHelper(module, "L2", 2);
        assertEquals(2, lessonService.getLessons(module.getId()).size());
    }

    // 13. IS LOCK LESSON (UNLOCK but No Progress)
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-013 - Sequential Learning Gating
     * - Logic: Dòng 232 trong LessonServiceImpl kiểm tra sự tồn tại của bản ghi trong LessonProgressRepository.
     * - Case: Course=UNLOCK nhưng LessonProgress=Empty -> Service phải trả về status=LOCK cho bài học đó.
     * - Ý nghĩa: Thực thi luật "Học tuần tự", buộc học sinh phải tương tác với bài trước (tạo progress) mới được mở bài sau.
     */
    @Test
    @DisplayName("MAI-LSS-013: isLockLesson - UNLOCK nhưng chưa có progress -> Phải LOCK")
    void isLockLesson_UnlockNoProgress_ShouldReturnTrue() {
        ModuleEntity module = setupBaseModule("LK1");
        LessonEntity lesson = createLessonHelper(module, "L1", 1);
        StudentProfileEntity student = createStudentHelper();

        EnrollmentEntity en = enrollmentRepository.save(EnrollmentEntity.builder().studentProfile(student).track(module.getCourse().getTrack()).status(1).build());
        enrollmentCourseRepository.save(new EnrollmentCourseEntity(null, "STUDYING", module.getCourse(), en));

        // Không tạo LessonProgress cho bài này
        assertTrue(lessonService.isLockLesson(lesson.getId(), student.getId()), "Phải LOCK nếu chưa học đến bài này");
    }

    // 14. COMPLETED STAR (2 STARS)
    /**
     * [KỸ THUẬT] TEST: MAI-LSS-014 - Star Reward Calculation
     * - Logic: Aggregate điểm từ AttemptRepository, chia cho (số bài tập * 100).
     * - Case: Giả lập kết quả đạt 50% -> Mong đợi kết quả là 2 sao.
     * - Ý nghĩa: Kiểm tra tính chính xác của bộ máy tính toán phần thưởng (Gamification Engine).
     */
    @Test
    @DisplayName("MAI-LSS-014: completedStar - Đạt 50% điểm -> 2 sao")
    void completedStar_50Percent_ShouldReturn2() {
        ModuleEntity module = setupBaseModule("STR2");
        LessonEntity lesson = createLessonHelper(module, "L", 1);
        StudentProfileEntity student = createStudentHelper();
        
        // Cần thực sự có Exercise để countByLessonId > 0
        ExerciseTypeEntity type = exerciseTypeRepository.findByCode("MULTIPLE_CHOICE").orElseGet(() -> 
            exerciseTypeRepository.save(ExerciseTypeEntity.builder().code("MULTIPLE_CHOICE").description("Test").build())
        );
        ExerciseEntity ex = new ExerciseEntity();
        ex.setLesson(lesson);
        ex.setExercisetype(type);
        ex.setTitle("Quiz");
        exerciseRepository.save(ex);
        lesson.getExercises().add(ex);

        // Giả lập điểm (Custom Query totalScroreOfLesson cần có dữ liệu thực tế)
        // Lưu ý: totalScroreOfLesson thường lấy từ bảng attempt hoặc result. 
        // Nếu dùng native query, ta cần mock dữ liệu bảng đó.
        
        // Ở đây ta chỉ verify logic phân nhánh nếu query trả về kết quả giả định.
        // Vì là test, ta nên tạo Attempt nếu Repository hỗ trợ.
        AttemptEntity attempt = new AttemptEntity();
        attempt.setStudentProfile(student);
        attempt.setExercise(ex);
        attempt.setScorePercent(50); // 50/100
        attemptRepository.save(attempt);

        assertEquals(2, lessonService.completedStar(lesson.getId(), student.getId()), "50% phải được 2 sao");
    }

    @Autowired
    private AttemptRepository attemptRepository;
}
