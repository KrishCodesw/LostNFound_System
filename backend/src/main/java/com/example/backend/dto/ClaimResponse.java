package com.example.backend.dto;

import lombok.Data;

@Data
public class ClaimResponse {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private String claimantName;
    private String proofDescription;
    private String status;
}