package com.example.backend.controller;
import java.security.Principal;
import com.example.backend.dto.ItemRequest;
import com.example.backend.dto.ItemResponse;
import com.example.backend.entity.Item;
import com.example.backend.service.ItemService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @PostMapping
    public ResponseEntity<ItemResponse> addItem(
            @RequestBody ItemRequest itemrequest,
            java.security.Principal principal) {

        // Extract the email from the verified JWT token
        String userEmail = principal.getName();

        // Pass both the request and the email to the service
        return ResponseEntity.ok(itemService.reportItem(itemrequest,userEmail));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemService.getItemById(id);
    }

    @PutMapping("/{id}")
    public Item updateItem(@PathVariable Long id,
                           @RequestBody Item item) {
        return itemService.updateItem(id, item);
    }

    @DeleteMapping("/{id}")
    public String deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return "Item deleted successfully";
    }
}