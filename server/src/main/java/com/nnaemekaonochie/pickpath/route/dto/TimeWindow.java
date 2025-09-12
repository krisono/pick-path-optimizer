package com.nnaemekaonochie.pickpath.route.dto;

import java.time.LocalTime;

public class TimeWindow {
    
    private String locationCode;
    private LocalTime startTime;
    private LocalTime endTime;
    
    // Constructors
    public TimeWindow() {}
    
    public TimeWindow(String locationCode, LocalTime startTime, LocalTime endTime) {
        this.locationCode = locationCode;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    // Getters and Setters
    public String getLocationCode() { return locationCode; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
