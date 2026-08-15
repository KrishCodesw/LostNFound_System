package com.example.backend.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.backend.state.STATUS;
@Entity
@Table(name = "claim_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "claimant_id")
    private User claimant;

    @Column(columnDefinition = "TEXT")
    private String proofDescription;
    private STATUS status;

}
