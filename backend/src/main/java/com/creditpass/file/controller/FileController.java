package com.creditpass.file.controller;

import com.creditpass.common.result.R;
import com.creditpass.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public R<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String url = fileService.upload(file);
        return R.ok(Map.of("url", url));
    }

    @GetMapping("/preview")
    public ResponseEntity<byte[]> preview(@RequestParam("url") String url) {
        FileService.PreviewFile preview = fileService.loadPreview(url);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (preview.contentType() != null && !preview.contentType().isBlank()) {
            mediaType = MediaType.parseMediaType(preview.contentType());
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES).cachePublic())
                .body(preview.bytes());
    }
}
