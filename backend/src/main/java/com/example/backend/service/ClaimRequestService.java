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
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClaimRequestService {

    private final ClaimRequestRepository claimRequestRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ClaimResponse submitClaim(ClaimSubmitRequest request, String userEmail) {
        User claimer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + request.getItemId()));

        ClaimRequest claim = new ClaimRequest();
        claim.setItem(item);
        claim.setClaimant(claimer);
        claim.setProofDescription(request.getProofDescription());
        claim.setStatus(STATUS.PENDING);

        return mapToResponse(claimRequestRepository.save(claim));
    }

    public ClaimResponse updateClaimStatus(Long id, String newStatus) {
        ClaimRequest claim = claimRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));

        claim.setStatus(STATUS.valueOf(newStatus.toUpperCase()));

        if (STATUS.APPROVED.name().equalsIgnoreCase(newStatus)) {
            Item item = claim.getItem();
            item.setStatus(STATUS.RESOLVED);
            itemRepository.save(item);
        }

        return mapToResponse(claimRequestRepository.save(claim));
    }

    /** Admin: returns every claim in the system. */
    public List<ClaimResponse> getAllClaims() {
        return claimRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Student: returns only the claims belonging to the authenticated user. */
    public List<ClaimResponse> getClaimsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return claimRequestRepository.findByClaimantId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ClaimResponse mapToResponse(ClaimRequest claim) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setItemId(claim.getItem().getId());
        response.setItemTitle(claim.getItem().getTitle());
        response.setClaimantName(claim.getClaimant().getName());
        response.setClaimantEmail(claim.getClaimant().getEmail());
        response.setProofDescription(claim.getProofDescription());
        response.setStatus(claim.getStatus() != null ? claim.getStatus().name() : STATUS.PENDING.name());
        response.setSubmittedAt(claim.getSubmittedAt());
        return response;
    }
}
