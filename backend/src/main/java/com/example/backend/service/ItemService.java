package com.example.backend.service;

import com.example.backend.dto.ItemRequest;
import com.example.backend.dto.ItemResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.Item;
import com.example.backend.entity.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    public ItemResponse reportItem(ItemRequest request, String userEmail) {

        // 1. Securely fetch the user using the email from the token
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));

        // 2. Fetch the category (assuming your ItemRequest has a categoryId)
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 3. Build the Item entity
        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLocation(request.getLocation());
        item.setType(request.getType()); // e.g., "LOST" or "FOUND"
        item.setCategory(category);

        // 4. Bind the securely fetched user
        item.setReportedBy(reporter);

        // 5. Save and return
        // 5. Save the item to the database
        Item savedItem = itemRepository.save(item);

        // 6. Map the saved entity to your ItemResponse DTO
        ItemResponse response = new ItemResponse();
        response.setId(savedItem.getId());
        response.setType(savedItem.getType());
        response.setTitle(savedItem.getTitle());
        response.setDescription(savedItem.getDescription());
        response.setImageUrl(savedItem.getImageUrl());
        response.setDateReported(savedItem.getDateReported());
        response.setLocation(savedItem.getLocation());
        response.setStatus(savedItem.getStatus());

        // Extract the nested names from the related entities
        if (savedItem.getReportedBy() != null) {
            response.setReporterName(savedItem.getReportedBy().getName());
        }
        if (savedItem.getCategory() != null) {
            response.setCategoryName(savedItem.getCategory().getName());
        }

        return response;
    }
    // Get All Items
    @Transactional()
    public List<ItemResponse> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Item By ID
    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    // Update Item
    public Item updateItem(Long id, Item updatedItem) {

        Item item = itemRepository.findById(id).orElse(null);

        if (item != null) {
            item.setTitle(updatedItem.getTitle());
            item.setDescription(updatedItem.getDescription());
            item.setType(updatedItem.getType());
            item.setLocation(updatedItem.getLocation());
            item.setStatus(updatedItem.getStatus());
            item.setImageUrl(updatedItem.getImageUrl());
            item.setCategory(updatedItem.getCategory());
            item.setReportedBy(updatedItem.getReportedBy());

            return itemRepository.save(item);
        }

        return null;
    }

    // Delete Item
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

//    Entity to DTO
    private ItemResponse mapToResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setType(item.getType());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setImageUrl(item.getImageUrl());
        response.setDateReported(item.getDateReported());
        response.setLocation(item.getLocation());
        response.setStatus(item.getStatus());

        if (item.getReportedBy() != null) {
            response.setReporterName(item.getReportedBy().getName());
        }
        if (item.getCategory() != null) {
            response.setCategoryName(item.getCategory().getName());
        }

        return response;
    }


}