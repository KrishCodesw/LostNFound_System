package com.example.backend.repository;

import com.example.backend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByType(String type);

    List<Item> findByStatus(String status);
}


// Later when we implement search will add methods like:
// List<Item> findByTitleContainingIgnoreCase(String title);
//
//List<Item> findByCategoryId(Long categoryId);
//
//List<Item> findByTypeAndStatus(String type, String status);