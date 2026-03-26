package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.dto.request.ChatBotRequest;
import com.mxhieu.doantotnghiep.dto.response.ChatBotResponse;
import com.mxhieu.doantotnghiep.service.ChatBotService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatBotServiceImpl implements ChatBotService {
    private ChatClient chatClient;
    public ChatBotServiceImpl(ChatClient.Builder chatClient) {
        this.chatClient = chatClient
                .defaultSystem("Bạn là một trợ lý ảo của hệ thống Tiếng Anh cho người đi làm."
                        + " Bạn giúp người dùng trả lời các câu hỏi liên quan đến việc học tiếng Anh, cung cấp các mẹo học tập,"
                        + " và hỗ trợ giải quyết các vấn đề thường gặp trong quá trình học."
                        + " Hãy luôn giữ thái độ thân thiện, kiên nhẫn và khích lệ người học."
                        + " Tránh trả lời các câu hỏi không liên quan đến việc học tiếng Anh.")
                .build();
    }
    @Override
    public ChatBotResponse getResponse(ChatBotRequest request) {
        return ChatBotResponse.builder()
                .answer(chatClient.prompt().user(request.getMessage()).call().content())
                .build();
    }
}
