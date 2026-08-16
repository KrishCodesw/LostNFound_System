package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClaimResponse {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private String claimantName;
    private String claimantEmail;
    private String proofDescription;
    private String status;
    private LocalDateTime submittedAt;
}
