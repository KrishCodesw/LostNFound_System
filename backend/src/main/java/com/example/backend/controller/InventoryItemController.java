package com.example.backend.controller;

import com.example.backend.dto.BulkInventoryUploadRequest;
import com.example.backend.dto.BulkInventoryUploadResponse;
import com.example.backend.dto.InventoryItemRequest;
import com.example.backend.dto.InventoryItemResponse;
import com.example.backend.dto.QuantityAdjustRequest;
import com.example.backend.service.InventoryItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * All endpoints here require an authenticated user with role ADMIN.
 * Enforced twice on purpose: once centrally in SecurityConfig (URL pattern)
 * and again here via @PreAuthorize (method-level), so a routing mistake in one
 * place doesn't silently expose these operations.
 */
@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @PostMapping("/bulk")
    public ResponseEntity<BulkInventoryUploadResponse> bulkUpload(
            @Valid @RequestBody BulkInventoryUploadRequest request,
            Principal principal) {
        return ResponseEntity.ok(inventoryItemService.bulkUpload(request, principal.getName()));
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(
            @Valid @RequestBody InventoryItemRequest request,
            Principal principal) {
        return ResponseEntity.ok(inventoryItemService.createItem(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<InventoryItemResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(inventoryItemService.list(search, categoryId, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request,
            Principal principal) {
        return ResponseEntity.ok(inventoryItemService.updateItem(id, request, principal.getName()));
    }

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<InventoryItemResponse> adjustQuantity(
            @PathVariable Long id,
            @Valid @RequestBody QuantityAdjustRequest request,
            Principal principal) {
        return ResponseEntity.ok(inventoryItemService.adjustQuantity(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        inventoryItemService.deleteItem(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
