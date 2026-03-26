package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.TestAttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.TestAttemptResponse;

public interface TestAttemptService {
    void saveResultFirstTest(TestAttemptRequest testAttemptRequest);

    void saveResultMiniTest(TestAttemptRequest testAttemptRequest);

    TestAttemptResponse getTestAttemptDetailById(Integer id);
}
