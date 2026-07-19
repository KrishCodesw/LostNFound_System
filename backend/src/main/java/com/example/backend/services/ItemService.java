package com.example.backend.services;


import com.example.backend.entities.Item;
import com.example.backend.repositories.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public List<Item> findSuggestedMatches(Item lostItem){
        if(lostItem.getCategory()==null||lostItem.getDescription()==null){
            return List.of();
        }
        String[] words=lostItem.getDescription().split("\\s+");
        String primaryKeyword="";

        for(String word:words){
            if(word.length()>3){
                primaryKeyword=word;
                break;
            }
        }
        //query for FOUND items in the same category containing the keyword
        return itemRepository.findByTypeAndCategoryAndDescriptionContainingIgnoreCase("FOUND",lostItem.getCategory().getId(),primaryKeyword);
    }

}
