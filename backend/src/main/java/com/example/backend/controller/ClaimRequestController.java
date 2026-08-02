package com.example.backend.controller;
import java.security.Principal;
import com.example.backend.dto.ClaimResponse;
import com.example.backend.dto.ClaimSubmitRequest;
import com.example.backend.entity.ClaimRequest;
import com.example.backend.service.ClaimRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimRequestController {

    @Autowired
    private ClaimRequestService claimRequestService;

    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(
            @RequestBody ClaimSubmitRequest request,
            Principal principal) {

        // Extract the email from the verified JWT
        String userEmail = principal.getName();

        // Pass the request and the securely obtained email to the service
        return ResponseEntity.ok(claimRequestService.submitClaim(request, userEmail));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ClaimResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(claimRequestService.updateClaimStatus(id, status));
    }

}
