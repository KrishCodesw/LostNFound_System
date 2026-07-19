package com.example.backend.controllers;

import com.example.backend.entities.Item;
import com.example.backend.services.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins="http://localhost:5173")
public class ItemController {

//    public ItemController(ItemService itemService){
//        this.itemService=itemService;
//    }
//
//    @PostMapping("/report")
//    public ResponseEntity<Item> reportItem(@RequestBody Item item){
//        Item savedItem=itemService.reportItem(item);
//        return ResponseEntity.ok(savedItem);
//    }

}
