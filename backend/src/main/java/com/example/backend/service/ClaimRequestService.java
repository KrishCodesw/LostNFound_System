package com.example.backend.service;

import com.example.backend.dto.ClaimResponse;
import com.example.backend.dto.ClaimSubmitRequest;
import com.example.backend.entity.ClaimRequest;
import com.example.backend.entity.Item;
import com.example.backend.entity.User;
import com.example.backend.repository.ClaimRequestRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.state.STATUS;
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

    public ClaimResponse submitClaim(ClaimSubmitRequest request, String userEmail) {

        // 1. Securely fetch the user (the claimer) using the token's email
        User claimer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // 2. Fetch the item they are trying to claim
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // 3. Build the claim entity
        ClaimRequest claim = new ClaimRequest();
        claim.setItem(item);
        claim.setClaimant(claimer);
        claim.setProofDescription(request.getProofDescription());
        claim.setStatus(STATUS.valueOf("PENDING")); // Default status for new claims

        // 4. Save to the database
        ClaimRequest savedClaim = claimRequestRepository.save(claim);

        // 5. Map to your response DTO
        ClaimResponse response = new ClaimResponse();
        response.setId(savedClaim.getId());
        response.setItemTitle(savedClaim.getItem().getTitle());
        response.setClaimantName(savedClaim.getClaimant().getName());
        response.setProofDescription(savedClaim.getProofDescription());
        response.setStatus(String.valueOf(savedClaim.getStatus()));
        // ... map any other fields

        return response;
    }

    public ClaimResponse updateClaimStatus(Long id, String newStatus) {
        ClaimRequest claim = claimRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(STATUS.valueOf(newStatus));

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
        response.setStatus(String.valueOf(claim.getStatus()));
        return response;
    }
}