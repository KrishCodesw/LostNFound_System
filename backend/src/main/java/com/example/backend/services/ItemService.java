package com.example.backend.services;


import com.example.backend.entities.Item;
import com.example.backend.repositories.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ItemService {
    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // Saving reported item to Db
    public Item reportItem(Item item){
        item.setDateReported(LocalDateTime.now());
        item.setStatus("OPEN");
        return (Item) itemRepository.save(item);
    }


}
