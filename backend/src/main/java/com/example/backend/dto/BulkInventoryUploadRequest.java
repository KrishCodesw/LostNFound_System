package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BulkInventoryUploadRequest {

    @NotEmpty(message = "At least one row is required")
    @Size(max = 500, message = "A single bulk upload cannot contain more than 500 rows")
    @Valid
    private List<InventoryItemRequest> items;

    /**
     * When true, if a row's (name + category + location) already exists,
     * its quantity is increased by the uploaded amount instead of creating a duplicate row.
     */
    private boolean mergeDuplicates = true;
}
