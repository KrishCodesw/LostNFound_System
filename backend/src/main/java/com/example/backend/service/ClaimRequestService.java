package com.example.backend.service;

import com.example.backend.dto.ClaimResponse;
import com.example.backend.dto.ClaimSubmitRequest;
import com.example.backend.entity.ClaimRequest;
import com.example.backend.entity.Item;
import com.example.backend.entity.User;
import com.example.backend.repository.ClaimRequestRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ClaimRequestService {

    @Autowired
    private ClaimRequestRepository claimRequestRepository;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private UserRepository userRepository;

    public ClaimResponse submitClaim(ClaimSubmitRequest request) {
        ClaimRequest claim = new ClaimRequest();

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));
        User claimant = userRepository.findById(request.getClaimantId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setProofDescription(request.getProofDescription());
        claim.setStatus("PENDING");

        // Update item status
        item.setStatus("CLAIM_PENDING");
        itemRepository.save(item);

        ClaimRequest savedClaim = claimRequestRepository.save(claim);
        return mapToResponse(savedClaim);
    }

    public ClaimResponse updateClaimStatus(Long id, String newStatus) {
        ClaimRequest claim = claimRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(newStatus);

        if (newStatus.equalsIgnoreCase("APPROVED")) {
            Item item = claim.getItem();
            item.setStatus("RESOLVED");
            itemRepository.save(item);
        }

        return mapToResponse(claimRequestRepository.save(claim));
    }

    private ClaimResponse mapToResponse(ClaimRequest claim) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setItemId(claim.getItem().getId());
        response.setItemTitle(claim.getItem().getTitle());
        response.setClaimantName(claim.getClaimant().getName());
        response.setProofDescription(claim.getProofDescription());
        response.setStatus(claim.getStatus());
        return response;
    }
}