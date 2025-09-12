package com.nnaemekaonochie.pickpath.route.dto;

import java.util.List;

public class EnhancedRouteStop {
    
    private Integer sequence;
    private String locationCode;
    private String sku;
    private Integer x;
    private Integer y;
    private Double legDistance;
    private Double cumulativeDistance;
    private Double estimatedTime;
    private List<String> actions;
    private List<String> zoneTransitions;
    private Integer aisleCrossings;
    private Integer turns;
    
    // Constructors
    public EnhancedRouteStop() {}
    
    public EnhancedRouteStop(Integer sequence, String locationCode, String sku, 
                           Integer x, Integer y, Double legDistance, Double cumulativeDistance) {
        this.sequence = sequence;
        this.locationCode = locationCode;
        this.sku = sku;
        this.x = x;
        this.y = y;
        this.legDistance = legDistance;
        this.cumulativeDistance = cumulativeDistance;
    }
    
    // Getters and Setters
    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    
    public String getLocationCode() { return locationCode; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }
    
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    
    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }
    
    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }
    
    public Double getLegDistance() { return legDistance; }
    public void setLegDistance(Double legDistance) { this.legDistance = legDistance; }
    
    public Double getCumulativeDistance() { return cumulativeDistance; }
    public void setCumulativeDistance(Double cumulativeDistance) { this.cumulativeDistance = cumulativeDistance; }
    
    public Double getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Double estimatedTime) { this.estimatedTime = estimatedTime; }
    
    public List<String> getActions() { return actions; }
    public void setActions(List<String> actions) { this.actions = actions; }
    
    public List<String> getZoneTransitions() { return zoneTransitions; }
    public void setZoneTransitions(List<String> zoneTransitions) { this.zoneTransitions = zoneTransitions; }
    
    public Integer getAisleCrossings() { return aisleCrossings; }
    public void setAisleCrossings(Integer aisleCrossings) { this.aisleCrossings = aisleCrossings; }
    
    public Integer getTurns() { return turns; }
    public void setTurns(Integer turns) { this.turns = turns; }
}
