package com.nnaemekaonochie.pickpath.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouse_zones")
public class WarehouseZone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String zoneId;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private ZoneType type;
    
    private String boundaries; // JSON string representing polygon
    private String accessPoints; // JSON string representing access points
    
    public enum ZoneType {
        PICKING, PACKING, RECEIVING, SHIPPING, STAGING, BLOCKED
    }
    
    // Constructors
    public WarehouseZone() {}
    
    public WarehouseZone(String zoneId, String name, ZoneType type) {
        this.zoneId = zoneId;
        this.name = name;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public ZoneType getType() { return type; }
    public void setType(ZoneType type) { this.type = type; }
    
    public String getBoundaries() { return boundaries; }
    public void setBoundaries(String boundaries) { this.boundaries = boundaries; }
    
    public String getAccessPoints() { return accessPoints; }
    public void setAccessPoints(String accessPoints) { this.accessPoints = accessPoints; }
}
