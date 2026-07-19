package com.example.backend.controllers;

import com.example.backend.entities.Item;
import com.example.backend.services.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins="http://localhost:5173")
public class ItemController {

    private final ItemService itemservice;

    public ItemController(ItemService itemservice) {
        this.itemservice = itemservice;
    }

    @PostMapping("/report")
    public ResponseEntity<Item> reportItem(@RequestBody Item item){
        Item savedItem =itemservice.reportItem(item);
        return ResponseEntity.ok(savedItem);
    }

    @PostMapping("/matches")
    public ResponseEntity<Item> matchItem(@RequestBody Item lostItem){
    List<Item> matches=itemservice.findSuggestedMatches(lostItem);
    return ResponseEntity.ok((Item) matches);
    }
}
