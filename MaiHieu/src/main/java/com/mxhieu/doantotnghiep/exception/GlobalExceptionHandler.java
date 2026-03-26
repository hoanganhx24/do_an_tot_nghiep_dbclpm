package com.mxhieu.doantotnghiep.exception;

import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.io.IOException;
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse> handleNoHandler(NoHandlerFoundException ex) {
        return ResponseEntity.status(404)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.builder()
                        .code(404)
                        .message("Endpoint not found: " + ex.getRequestURL())
                        .build());
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        return ResponseEntity.status(errorCode.getHttpStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getHttpStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<?> handleIOException(IOException ex, HttpServletRequest request) {

        // Nếu lỗi xảy ra trong API stream video thì trả text/plain
        if (request.getRequestURI().contains("/videos/stream")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error reading video: " + ex.getMessage());
        }

        // Các API khác trả JSON
        return ResponseEntity.status(500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.builder()
                        .code(500)
                        .message("File processing error: " + ex.getMessage())
                        .build());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.builder()
                        .code(500)
                        .message(ex.getMessage())
                        .build());
    }
}

