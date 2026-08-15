package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkInventoryUploadResponse {
    private int createdCount;
    private int mergedCount;
    private int totalRowsProcessed;
    private List<InventoryItemResponse> items;
}
