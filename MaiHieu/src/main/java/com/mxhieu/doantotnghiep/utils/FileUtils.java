package com.mxhieu.doantotnghiep.utils;

import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Component
public class FileUtils {
    // Validate file
    public void validateFile( MultipartFile file) {
        // Kiểm tra tên file
        String fileName = file.getOriginalFilename();
        if(fileName == null || fileName.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NAME_EMPTY);
        }

        // image.png -> png
        // avatar.jpg -> jpg
        // Kiểm tra đuôi file (jpg, png, jpeg)
        String fileExtension = getFileExtension(fileName);
        if(!checkFileExtension(fileExtension)) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        // Kiểm tra dung lượng file (<= 100MB)
        double fileSize =  (double) (file.getSize() / 1_048_576);
        if( fileSize > 100) {
            throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED);
        }
    }

    // Lấy extension của file (ví dụ png, jpg, ...)
    public String getFileExtension(String fileName) {
        int lastIndexOf = fileName.lastIndexOf(".");
        return fileName.substring(lastIndexOf + 1);
    }

    // Kiểm tra extension của file có được phép hay không
    public boolean checkFileExtension(String fileExtension) {
        List<String> extensions = new ArrayList<>(List.of(
                "png", "jpg", "jpeg", "pdf",    // ảnh & tài liệu
                "mp4", "mov", "avi", "mkv", "wmv" // video
        ));
        return extensions.contains(fileExtension.toLowerCase());
    }
}