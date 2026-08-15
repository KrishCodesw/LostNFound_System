package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryItemResponse {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private Integer quantity;
    private String location;
    private String description;
    private String createdByName;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long version;
}
