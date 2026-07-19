package com.example.backend.service;

import com.example.backend.entity.Item;
import com.example.backend.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    // Add Item
    public Item addItem(Item item) {
        item.setDateReported(LocalDateTime.now());
        item.setStatus("OPEN");
        return itemRepository.save(item);
    }

    // Get All Items
    public List<Item> getAllItems() {
        return itemRepository.findAll();
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
}