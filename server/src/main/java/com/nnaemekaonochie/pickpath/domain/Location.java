package com.nnaemekaonochie.pickpath.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String locationCode; // e.g. A01-B05-L2

    private int x;
    private int y;
    private String zone;
    private String aisle;
    private String bay;
    private String level;

    public Location() {
    }

    public Location(String code, int x, int y, String zone, String aisle, String bay, String level) {
        this.locationCode = code;
        this.x = x;
        this.y = y;
        this.zone = zone;
        this.aisle = aisle;
        this.bay = bay;
        this.level = level;
    }

    public Long getId() {
        return id;
    }

    public String getLocationCode() {
        return locationCode;
    }

    public void setLocationCode(String c) {
        this.locationCode = c;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getAisle() {
        return aisle;
    }

    public void setAisle(String aisle) {
        this.aisle = aisle;
    }

    public String getBay() {
        return bay;
    }

    public void setBay(String bay) {
        this.bay = bay;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}