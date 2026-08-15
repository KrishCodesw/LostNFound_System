package com.example.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InventoryItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 150, message = "Item name must be at most 150 characters")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Max(value = 100000, message = "Quantity is unrealistically large")
    private Integer quantity;

    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;
}
