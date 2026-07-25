package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ItemResponse {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String imageUrl;
    private LocalDateTime dateReported;
    private String location;
    private String status;
    private String reporterName;
    private String categoryName;
}