package com.example.backend.repository;

import com.example.backend.entity.ClaimRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {
    List<ClaimRequest> findByItemId(Long itemId);
    List<ClaimRequest> findByClaimantId(Long claimantId);
}