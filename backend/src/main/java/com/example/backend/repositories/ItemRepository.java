package com.example.backend.repositories;

import com.example.backend.entities.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository {
    List<Item> findByType(String type);
    List<Item> findByTypeAndCategoryAndDescriptionContainingIgnoreCase(String type, Long categoryId, String keyword);
    List<Item> findByStatus(String status);


}
