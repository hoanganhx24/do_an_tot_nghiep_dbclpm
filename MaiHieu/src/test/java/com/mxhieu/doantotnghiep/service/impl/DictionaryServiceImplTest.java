package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.response.DictionaryResponse;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.repository.*;
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
 * Integration Test cho DictionaryServiceImpl sử dụng MySQL.
 *
 * Nghiệp vụ: Tra cứu từ điển và quản lý từ vựng cá nhân (UC 2.3.x).
 * - Tra cứu từ từ DB nếu đã tồn tại để tối ưu API calls.
 * - Gợi ý từ (Autocomplete) dựa trên dữ liệu đã tra cứu.
 * - Ràng buộc nhập liệu (Input Validation) cho từ khóa tra cứu.
 *
 * Liên kết System Test:
 * - TD_VA_01: Kiểm tra ký tự đặc biệt.
 * - TD_VA_03: Kiểm tra ký tự số.
 *
 * Cấu trúc test: DATA (MySQL) -> ACTION -> CHECK -> ROLLBACK.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DictionaryServiceImplTest {

    @Autowired
    private DictionaryServiceImpl dictionaryService;

    @Autowired
    private DictionaryRepository dictionaryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    private StudentProfileEntity createStudent() {
        UserEntity user = new UserEntity();
        user.setEmail("std_dict_" + System.currentTimeMillis() + "@test.com");
        user.setStatus("ACTIVE");
        user = userRepository.save(user);

        StudentProfileEntity student = new StudentProfileEntity();
        student.setUser(user);
        return studentProfileRepository.save(student);
    }

    // ==================== MAI-DIC-001 ====================
    @Test
    @DisplayName("MAI-DIC-001: Tìm kiếm từ - Đã có trong DB -> Trả về từ DB (Không gọi API)")
    void search_WordInDb_ShouldReturnFromDb() {
        // === DATA ===
        DictionaryEntity dictEntity = new DictionaryEntity();
        dictEntity.setWord("integration");
        dictEntity.setPartOfSpeech(new ArrayList<>());
        dictionaryRepository.save(dictEntity);

        StudentProfileEntity student = createStudent();

        // === ACTION ===
        DictionaryResponse response = dictionaryService.search("integration", student.getId());

        // === CHECK DB/DATA ===
        assertNotNull(response);
        assertEquals("integration", response.getWord());
        // Ở mức integration, ta verify dữ liệu trả về đúng ID đã save trong DB
        assertEquals(dictEntity.getId(), response.getId());
    }

    // ==================== MAI-DIC-002 ====================
    @Test
    @DisplayName("MAI-DIC-002: Tìm kiếm từ chứa số (TD_VA_03) - Phải ném ngoại lệ")
    void search_WordWithNumbers_ShouldThrow() {
        // === DATA ===
        String word = "123";

        // === ACTION + CHECK ===
        // Note: Nếu code chưa fix validation, test này sẽ FAIL (hoặc gọi API và fail tại API)
        assertThrows(AppException.class, () -> dictionaryService.search(word, 1));
    }

    // ==================== MAI-DIC-003 ====================
    @Test
    @DisplayName("MAI-DIC-003: Tìm kiếm ký tự đặc biệt (TD_VA_01) - Phải ném ngoại lệ")
    void search_WordWithSpecialChars_ShouldThrow() {
        // === DATA ===
        String word = "%^%";

        // === ACTION + CHECK ===
        assertThrows(AppException.class, () -> dictionaryService.search(word, 1));
    }

    // ==================== MAI-DIC-004 ====================
    @Test
    @DisplayName("MAI-DIC-004: Lấy danh sách gợi ý - Top 10 từ MySQL")
    void getSuggestionWord_ShouldReturnList() {
        // === DATA ===
        DictionaryEntity d1 = new DictionaryEntity(); d1.setWord("apple");
        DictionaryEntity d2 = new DictionaryEntity(); d2.setWord("application");
        dictionaryRepository.save(d1);
        dictionaryRepository.save(d2);

        // === ACTION ===
        List<String> result = dictionaryService.getSuggestionWord("app");

        // === CHECK DB/DATA ===
        assertTrue(result.size() >= 2);
        assertTrue(result.contains("apple"));
        assertTrue(result.contains("application"));
    }
}
