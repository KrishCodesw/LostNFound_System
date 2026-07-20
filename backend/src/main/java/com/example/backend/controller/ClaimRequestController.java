package com.example.backend.controller;

import com.example.backend.entity.ClaimRequest;
import com.example.backend.service.ClaimRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimRequestController {

    @Autowired
    private ClaimRequestService claimRequestService;

    @PostMapping
    private ClaimRequest submitClaim(@RequestBody ClaimRequest claimRequest){
        return claimRequestService.submitClaim(claimRequest);
    }

    @GetMapping
    public List<ClaimRequest> getAllClaims(){
        return claimRequestService.getAllClaims();
    }

    @PutMapping("/{id}/status")
    public ClaimRequest updateClaimStatus(@PathVariable Long id,@RequestParam String status){
        return claimRequestService.updateClaimStatus(id,status);
    }

}
