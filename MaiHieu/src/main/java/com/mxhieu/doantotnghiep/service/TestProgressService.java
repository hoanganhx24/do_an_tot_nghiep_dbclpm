package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.TestProgressRequest;

public interface TestProgressService {
    Boolean checkCompletionCondition(TestProgressRequest request);
}
