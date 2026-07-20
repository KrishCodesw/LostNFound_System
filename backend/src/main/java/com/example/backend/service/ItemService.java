package com.example.backend.service;

import com.example.backend.dto.ItemRequest;
import com.example.backend.dto.ItemResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.Item;
import com.example.backend.entity.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;


    // Add Item
    public ItemResponse reportItem(ItemRequest request){
        Item item=new Item();
        item.setType(request.getType());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl());
        item.setLocation(request.getLocation());
        item.setDateReported(LocalDateTime.now());
        item.setStatus("OPEN");

        Category category=categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User user = userRepository.findById(request.getReporterId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        item.setCategory(category);
        item.setReportedBy(user);

        Item savedItem = itemRepository.save(item);
        return mapToResponse(savedItem);
    }

    // Get All Items
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