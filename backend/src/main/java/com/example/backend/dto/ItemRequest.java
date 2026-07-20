package com.example.backend.dto;
import lombok.Data;

@Data
public class ItemRequest {
    private String type; // "LOST" or "FOUND"
    private String title;
    private String description;
    private String imageUrl;
    private String location;
    private Long categoryId;
    private Long reporterId; //To be replaced by JWT context later
}
