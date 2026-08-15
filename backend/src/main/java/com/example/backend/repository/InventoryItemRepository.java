package com.example.backend.repository;

import com.example.backend.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByNameIgnoreCaseAndCategoryIdAndLocationIgnoreCase(
            String name, Long categoryId, String location);

    @Query("""
            select i from InventoryItem i
            where (:search is null or lower(i.name) like lower(concat('%', :search, '%')))
              and (:categoryId is null or i.category.id = :categoryId)
            order by i.name asc
            """)
    Page<InventoryItem> search(@Param("search") String search,
                                @Param("categoryId") Long categoryId,
                                Pageable pageable);
}
