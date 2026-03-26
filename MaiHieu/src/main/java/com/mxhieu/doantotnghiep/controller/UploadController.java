package com.mxhieu.doantotnghiep.controller;

import com.mxhieu.doantotnghiep.dto.response.ApiResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.apache.commons.io.FileUtils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class UploadController {

    /**
     * API nhận từng CHUNK từ FE gửi lên
     * FE sẽ chia file thành nhiều phần nhỏ và gửi từng phần một
     *
     * @param fileId: id duy nhất của file (FE tự tạo UUID) → dùng để gom đúng file
     * @param chunkIndex: thứ tự của chunk (0,1,2,...)
     * @param chunk: phần dữ liệu nhỏ FE upload
     */
    @PostMapping("/chunk")
    public ResponseEntity<?> uploadChunk(
            @RequestParam("fileId") String fileId,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("chunk") MultipartFile chunk
    ) throws IOException {

        // Tạo thư mục tạm để chứa các chunk của file
        // Ví dụ: uploads/temp/1234-uuid/
        Path uploadTemp = Paths.get("uploads/temp/" + fileId);
        Files.createDirectories(uploadTemp);

        // Tạo file chunk với tên chunk_0, chunk_1, chunk_2,...
        Path chunkPath = uploadTemp.resolve("chunk_" + chunkIndex);

        // Ghi dữ liệu chunk vào file
        Files.write(chunkPath, chunk.getBytes());

        return ResponseEntity.ok("CHUNK RECEIVED");
    }

    /**
     * API MERGE: FE gọi API này khi đã upload xong tất cả chunk
     *
     * @param fileId: file id dùng để xác định thư mục chứa các chunk
     * @param totalChunks: tổng số chunk FE đã gửi lên
     * @param fileName: tên file gốc (vd: video.mp4)
     */
    @PostMapping("/chunk/merge")
    public ApiResponse<?> mergeChunks(
            @RequestParam String fileId,
            @RequestParam int totalChunks,
            @RequestParam String fileName
    ) throws IOException, InterruptedException {

        // Thư mục chứa chunk
        Path tempDir = Paths.get("uploads/temp/" + fileId);

        // Thư mục chứa raw file (separate — tránh Windows lock file)
        Path rawDir = Paths.get("uploads/raw");
        Files.createDirectories(rawDir);

        // Thư mục chứa final video
        Path finalDir = Paths.get("uploads/videos");
        Files.createDirectories(finalDir);

        // File RAW sau merge (PHẢI khác tên file final)
        Path mergedFile = rawDir.resolve("raw_" + fileName);

        // MERGE chunk
        try (OutputStream output = Files.newOutputStream(mergedFile)) {
            for (int i = 0; i < totalChunks; i++) {
                Path chunkFile = tempDir.resolve("chunk_" + i);
                Files.copy(chunkFile, output);
            }
        }

        // File FINAL sau khi convert faststart
        Path finalFile = finalDir.resolve(fileName);

        // Nếu file final đã tồn tại → xóa để tránh bị Windows lock / FFmpeg refuse
        if (Files.exists(finalFile)) {
            Files.delete(finalFile);
        }

        // FFmpeg convert raw → final với faststart
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-i", mergedFile.toString(),
                "-movflags", "+faststart",
                "-c", "copy",
                finalFile.toString()
        );

        Process process = pb.start();

        // Log FFmpeg
        BufferedReader br = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String line;
        System.out.println("=== FFMPEG ERROR LOG START ===");
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
        System.out.println("=== FFMPEG ERROR LOG END ===");

        int exitCode = process.waitFor();
        System.out.println("FFMPEG EXIT CODE = " + exitCode);

        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg convert failed");
        }

        // Xóa raw file và folder temp sau khi convert xong
        Files.deleteIfExists(mergedFile);
        FileUtils.deleteDirectory(tempDir.toFile());

        // Trả về path video cho FE
        return ApiResponse.builder()
                .code(200)
                .message("MERGE SUCCESS")
                .data("/uploads/videos/" + fileName)
                .build();
    }


    @GetMapping("/videos/stream")
    public ResponseEntity<Resource> streamVideo(
            @RequestParam String pathFile,
            @RequestHeader(value = "Range", required = false) String rangeHeader
    ) throws IOException {

        Path filePath = Paths.get(System.getProperty("user.dir"), pathFile);
        File videoFile = filePath.toFile();

        if (!videoFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        long fileLength = videoFile.length();
        long rangeStart = 0;
        long rangeEnd = fileLength - 1;

        if (rangeHeader != null) {
            String[] ranges = rangeHeader.replace("bytes=", "").split("-");
            rangeStart = Long.parseLong(ranges[0]);

            if (ranges.length > 1 && !ranges[1].isEmpty()) {
                rangeEnd = Long.parseLong(ranges[1]);
            }
            if (rangeEnd >= fileLength) {
                rangeEnd = fileLength - 1;
            }
        }

        long contentLength = rangeEnd - rangeStart + 1;

        InputStream inputStream = new FileInputStream(videoFile);
        inputStream.skip(rangeStart);

        InputStreamResource inputStreamResource = new InputStreamResource(
                new LimitedInputStream(inputStream, contentLength)
        );

        return ResponseEntity.status(rangeHeader == null ? 200 : 206)
                .header("Content-Type", "video/mp4")
                .header("Accept-Ranges", "bytes")
                .header("Content-Length", String.valueOf(contentLength))
                .header("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength)
                .body(inputStreamResource);
    }

    /**
     * InputStream giới hạn số byte đọc, tránh đọc quá mức cần thiết
     */
    class LimitedInputStream extends FilterInputStream {
        private long remaining;

        protected LimitedInputStream(InputStream in, long limit) {
            super(in);
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) return -1;
            int result = super.read();
            if (result != -1) remaining--;
            return result;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (remaining <= 0) return -1;
            len = (int) Math.min(len, remaining);
            int result = super.read(b, off, len);
            if (result != -1) remaining -= result;
            return result;
        }
    }


}
