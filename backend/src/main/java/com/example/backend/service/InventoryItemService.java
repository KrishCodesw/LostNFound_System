package com.example.backend.service;

import com.example.backend.dto.BulkInventoryUploadRequest;
import com.example.backend.dto.BulkInventoryUploadResponse;
import com.example.backend.dto.InventoryItemRequest;
import com.example.backend.dto.InventoryItemResponse;
import com.example.backend.dto.QuantityAdjustRequest;
import com.example.backend.entity.Category;
import com.example.backend.entity.InventoryItem;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.InventoryItemRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.state.ROLE;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryItemService {

    private static final int MAX_BULK_ROWS = 500;

    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                 CategoryRepository categoryRepository,
                                 UserRepository userRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    private User requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (!ROLE.ADMIN.equals(user.getRole())) {
            // Defense in depth: controller/security layer should already have blocked this.
            throw new AccessDeniedException("Admin privileges required");
        }
        return user;
    }

    private Category resolveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
    }

    private String clean(String s) {
        if (s == null) return null;
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Same as {@link #clean(String)} but never returns null — used for the "location"
     * field specifically, because it participates in the merge-duplicate lookup and the
     * DB unique constraint. NULL columns don't match '' in equality comparisons, and
     * MySQL allows unlimited rows with NULL in a unique index, so leaving this nullable
     * would silently break duplicate merging and let identical rows pile up. Normalizing
     * to '' keeps both mechanisms working.
     */
    private String cleanLocation(String s) {
        String cleaned = clean(s);
        return cleaned == null ? "" : cleaned;
    }

    @Transactional
    public BulkInventoryUploadResponse bulkUpload(BulkInventoryUploadRequest request, String adminEmail) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidRequestException("At least one row is required");
        }
        if (request.getItems().size() > MAX_BULK_ROWS) {
            throw new InvalidRequestException("A single upload cannot exceed " + MAX_BULK_ROWS + " rows");
        }

        User admin = requireAdmin(adminEmail);

        int created = 0;
        int merged = 0;
        List<InventoryItemResponse> results = new ArrayList<>();

        for (InventoryItemRequest row : request.getItems()) {
            String name = clean(row.getName());
            if (!StringUtils.hasText(name)) {
                throw new InvalidRequestException("Every row must have an item name");
            }
            if (row.getCategoryId() == null) {
                throw new InvalidRequestException("Every row must have a category: " + name);
            }
            if (row.getQuantity() == null || row.getQuantity() < 0) {
                throw new InvalidRequestException("Quantity must be zero or greater for: " + name);
            }

            Category category = resolveCategory(row.getCategoryId());
            String location = cleanLocation(row.getLocation());

            InventoryItem existing = request.isMergeDuplicates()
                    ? inventoryItemRepository
                        .findByNameIgnoreCaseAndCategoryIdAndLocationIgnoreCase(name, category.getId(), location)
                        .orElse(null)
                    : null;

            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + row.getQuantity());
                if (StringUtils.hasText(row.getDescription())) {
                    existing.setDescription(clean(row.getDescription()));
                }
                existing.setUpdatedBy(admin);
                InventoryItem saved = inventoryItemRepository.save(existing);
                results.add(toResponse(saved));
                merged++;
            } else {
                InventoryItem item = new InventoryItem();
                item.setName(name);
                item.setCategory(category);
                item.setQuantity(row.getQuantity());
                item.setLocation(location);
                item.setDescription(clean(row.getDescription()));
                item.setCreatedBy(admin);
                item.setUpdatedBy(admin);
                InventoryItem saved = inventoryItemRepository.save(item);
                results.add(toResponse(saved));
                created++;
            }
        }

        return new BulkInventoryUploadResponse(created, merged, request.getItems().size(), results);
    }

    @Transactional
    public InventoryItemResponse createItem(InventoryItemRequest request, String adminEmail) {
        User admin = requireAdmin(adminEmail);
        Category category = resolveCategory(request.getCategoryId());

        InventoryItem item = new InventoryItem();
        item.setName(clean(request.getName()));
        item.setCategory(category);
        item.setQuantity(request.getQuantity());
        item.setLocation(cleanLocation(request.getLocation()));
        item.setDescription(clean(request.getDescription()));
        item.setCreatedBy(admin);
        item.setUpdatedBy(admin);

        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public Page<InventoryItemResponse> list(String search, Long categoryId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 200);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("name").ascending());
        String cleanedSearch = clean(search);
        return inventoryItemRepository.search(cleanedSearch, categoryId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public InventoryItemResponse updateItem(Long id, InventoryItemRequest request, String adminEmail) {
        User admin = requireAdmin(adminEmail);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));

        item.setName(clean(request.getName()));
        item.setCategory(resolveCategory(request.getCategoryId()));
        item.setQuantity(request.getQuantity());
        item.setLocation(cleanLocation(request.getLocation()));
        item.setDescription(clean(request.getDescription()));
        item.setUpdatedBy(admin);

        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponse adjustQuantity(Long id, QuantityAdjustRequest request, String adminEmail) {
        User admin = requireAdmin(adminEmail);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));

        if (request.getExpectedVersion() != null && item.getVersion() != null
                && !request.getExpectedVersion().equals(item.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(InventoryItem.class, id);
        }

        int newQuantity = switch (request.getMode()) {
            case SET -> request.getValue();
            case DELTA -> item.getQuantity() + request.getValue();
        };

        if (newQuantity < 0) {
            throw new InvalidRequestException("Quantity cannot go below zero");
        }
        if (newQuantity > 100000) {
            throw new InvalidRequestException("Quantity is unrealistically large");
        }

        item.setQuantity(newQuantity);
        item.setUpdatedBy(admin);

        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id, String adminEmail) {
        requireAdmin(adminEmail);
        if (!inventoryItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found: " + id);
        }
        inventoryItemRepository.deleteById(id);
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        InventoryItemResponse response = new InventoryItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setQuantity(item.getQuantity());
        response.setLocation(item.getLocation());
        response.setDescription(item.getDescription());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        response.setVersion(item.getVersion());
        if (item.getCategory() != null) {
            response.setCategoryId(item.getCategory().getId());
            response.setCategoryName(item.getCategory().getName());
        }
        if (item.getCreatedBy() != null) {
            response.setCreatedByName(item.getCreatedBy().getName());
        }
        if (item.getUpdatedBy() != null) {
            response.setUpdatedByName(item.getUpdatedBy().getName());
        }
        return response;
    }
}
