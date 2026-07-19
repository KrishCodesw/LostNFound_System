package com.example.backend.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "claim_requests")
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
    private String status;

    public ClaimRequest(){}

    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}

    public Item getItem(){return item;}
    public void setItem(Item item){this.item=item;}

    public User getClaimant(){return claimant;}
    public void setClaimant(User claimant){this.claimant=claimant;}

    public String getProofDescription(){return proofDescription;}
    public void setProofDescription(String proofDescription){this.proofDescription=proofDescription;}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

}
