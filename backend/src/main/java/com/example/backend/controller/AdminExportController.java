package com.example.backend.controller;

import com.example.backend.service.ExportService;
import lombok.AllArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Admin-only data export. Restricted both by SecurityConfig's
 * "/api/admin/**" -> hasRole('ADMIN') matcher and, belt-and-suspenders,
 * by @PreAuthorize here.
 */
@RestController
@RequestMapping("/api/admin/export")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class AdminExportController {

    private static final DateTimeFormatter FILE_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ExportService exportService;

    @GetMapping
    public ResponseEntity<byte[]> exportAll() {
        byte[] workbook = exportService.buildWorkbook();
        String filename = "lost-and-found-export-" + LocalDate.now().format(FILE_DATE_FMT) + ".xlsx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(workbook);
    }
}
