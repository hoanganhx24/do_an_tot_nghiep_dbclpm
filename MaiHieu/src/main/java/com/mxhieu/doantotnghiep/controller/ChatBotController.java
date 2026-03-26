package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.request.ChatBotRequest;
import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import com.mxhieu.doantotnghiep.dto.response.ChatBotResponse;
import com.mxhieu.doantotnghiep.service.ChatBotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatBotController {
    private final ChatBotService chatBotService;
    @PostMapping
    public ApiResponse<ChatBotResponse> getResponse(@RequestBody ChatBotRequest message) {
        return ApiResponse.<ChatBotResponse>builder()
                .code(200)
                .message("Success")
                .data(chatBotService.getResponse(message))
                .build();
    }
}
