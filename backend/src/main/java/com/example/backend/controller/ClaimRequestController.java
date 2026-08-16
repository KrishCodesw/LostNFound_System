package com.example.backend.controller;

import com.example.backend.dto.ClaimResponse;
import com.example.backend.dto.ClaimSubmitRequest;
import com.example.backend.service.ClaimRequestService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@AllArgsConstructor
public class ClaimRequestController {

    private final ClaimRequestService claimRequestService;

    /** Any authenticated user can submit a claim. */
    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(
            @RequestBody ClaimSubmitRequest request,
            Principal principal) {
        return ResponseEntity.ok(claimRequestService.submitClaim(request, principal.getName()));
    }

    /** Admin only: returns all claims across every user. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimRequestService.getAllClaims());
    }

    /** Any authenticated user: returns only their own claims. */
    @GetMapping("/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(Principal principal) {
        return ResponseEntity.ok(claimRequestService.getClaimsByUser(principal.getName()));
    }

    /** Admin only: approve or reject a claim. */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(claimRequestService.updateClaimStatus(id, body.get("status")));
    }
}
