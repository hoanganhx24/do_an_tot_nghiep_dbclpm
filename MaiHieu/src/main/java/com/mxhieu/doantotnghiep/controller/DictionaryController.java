package com.mxhieu.doantotnghiep.controller;


import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.DictionaryResponse;
import com.mxhieu.doantotnghiep.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dictionary")
@RequiredArgsConstructor // Lombok tự động sinh constructor cho các biến final
public class DictionaryController {

    // Service xử lý logic tra cứu từ điển
    private final DictionaryService dictionaryService;

    /**
     * API tra cứu từ trong từ điển
     * Nhận từ cần tra và ID của học viên
     * Lưu lại lịch sử tra cứu theo học viên (nếu có)
     */
    @GetMapping
    public ApiResponse<?> searchInDictionary(
            @RequestParam String word,
            @RequestParam Integer studentId) {

        // Gọi service để tìm kiếm từ trong từ điển
        return ApiResponse.builder()
                .code(200)
                .data(dictionaryService.search(word, studentId))
                .build();
    }

    /**
     * API gợi ý từ vựng khi tìm kiếm
     * Trả về danh sách các từ có liên quan hoặc gần đúng với từ khóa tìm kiếm
     */
    @GetMapping("/suggestion")
    public ApiResponse<?> suggestion(@RequestParam String word) {

        // Gọi service để lấy danh sách từ gợi ý
        return ApiResponse.builder()
                .code(200)
                .data(dictionaryService.getSuggestionWord(word))
                .build();
    }
}