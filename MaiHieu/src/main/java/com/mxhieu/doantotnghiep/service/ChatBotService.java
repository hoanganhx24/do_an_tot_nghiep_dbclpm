package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.ChatBotRequest;
import com.mxhieu.doantotnghiep.dto.response.ChatBotResponse;

public interface ChatBotService {
    ChatBotResponse getResponse(ChatBotRequest request);
}
