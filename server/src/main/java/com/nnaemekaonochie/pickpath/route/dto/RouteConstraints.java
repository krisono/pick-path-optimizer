package com.nnaemekaonochie.pickpath.route.dto;

import java.util.List;

public class RouteConstraints {
    
    private Integer maxCapacity;
    
    private Integer maxTimeMinutes;
    
    private Boolean avoidBlockedZones = true;
    
    private Boolean allowAisleCrossing = true;
    
    private List<TimeWindow> timeWindows;
    
    // Constructors
    public RouteConstraints() {}
    
    public RouteConstraints(Integer maxCapacity, Integer maxTimeMinutes) {
        this.maxCapacity = maxCapacity;
        this.maxTimeMinutes = maxTimeMinutes;
    }
    
    // Getters and Setters
    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    
    public Integer getMaxTimeMinutes() { return maxTimeMinutes; }
    public void setMaxTimeMinutes(Integer maxTimeMinutes) { this.maxTimeMinutes = maxTimeMinutes; }
    
    public Boolean getAvoidBlockedZones() { return avoidBlockedZones; }
    public void setAvoidBlockedZones(Boolean avoidBlockedZones) { this.avoidBlockedZones = avoidBlockedZones; }
    
    public Boolean getAllowAisleCrossing() { return allowAisleCrossing; }
    public void setAllowAisleCrossing(Boolean allowAisleCrossing) { this.allowAisleCrossing = allowAisleCrossing; }
    
    public List<TimeWindow> getTimeWindows() { return timeWindows; }
    public void setTimeWindows(List<TimeWindow> timeWindows) { this.timeWindows = timeWindows; }
}
