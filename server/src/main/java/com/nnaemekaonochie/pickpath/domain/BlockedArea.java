package com.nnaemekaonochie.pickpath.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blocked_areas")
public class BlockedArea {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String areaId;
    
    private String reason;
    private String boundaries; // JSON string representing polygon
    private LocalDateTime createdAt;
    private LocalDateTime temporaryUntil;
    private Boolean isPermanent = false;
    
    // Constructors
    public BlockedArea() {
        this.createdAt = LocalDateTime.now();
    }
    
    public BlockedArea(String areaId, String reason, String boundaries) {
        this();
        this.areaId = areaId;
        this.reason = reason;
        this.boundaries = boundaries;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAreaId() { return areaId; }
    public void setAreaId(String areaId) { this.areaId = areaId; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getBoundaries() { return boundaries; }
    public void setBoundaries(String boundaries) { this.boundaries = boundaries; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getTemporaryUntil() { return temporaryUntil; }
    public void setTemporaryUntil(LocalDateTime temporaryUntil) { this.temporaryUntil = temporaryUntil; }
    
    public Boolean getIsPermanent() { return isPermanent; }
    public void setIsPermanent(Boolean isPermanent) { this.isPermanent = isPermanent; }
}
