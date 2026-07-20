package com.example.backend.dto;

import lombok.Data;

@Data
public class ClaimSubmitRequest {
    private Long itemId;
    private Long claimantId; // To be replaced by JWT context later
    private String proofDescription;
}