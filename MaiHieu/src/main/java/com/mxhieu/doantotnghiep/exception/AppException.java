package com.mxhieu.doantotnghiep.exception;

import lombok.Data;

@Data
public class AppException extends RuntimeException {
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    // Constructor cho message tùy biến
    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
    private ErrorCode errorCode;
}
