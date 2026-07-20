package com.example.backend.service;

import com.example.backend.entity.ClaimRequest;
import com.example.backend.repository.ClaimRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimRequestService {
    @Autowired
    private ClaimRequestRepository claimRequestRepository;


    public ClaimRequest submitClaim(ClaimRequest claimRequest){
        claimRequest.setStatus("PENDING");
        return claimRequestRepository.save(claimRequest);
    }


    public List<ClaimRequest> getAllClaims() {
        return claimRequestRepository.findAll();
    }

    public ClaimRequest updateClaimStatus(Long id, String newStatus){
        ClaimRequest claim = claimRequestRepository.findById(id).orElse(null);
        if(claim != null){
            claim.setStatus(newStatus);
            return claimRequestRepository.save(claim);
        }
        return null;
    }
}