package com.nnaemekaonochie.pickpath.route.dto;

public class RouteMetrics {
    
    private Double totalDistance;
    private Double totalTime;
    private Integer aisleCrossings;
    private Integer totalTurns;
    private Integer zoneTransitions;
    private Double efficiencyScore;
    private Double comparedToOptimal;
    
    // Constructors
    public RouteMetrics() {}
    
    public RouteMetrics(Double totalDistance, Double totalTime, Integer aisleCrossings,
                       Integer totalTurns, Integer zoneTransitions) {
        this.totalDistance = totalDistance;
        this.totalTime = totalTime;
        this.aisleCrossings = aisleCrossings;
        this.totalTurns = totalTurns;
        this.zoneTransitions = zoneTransitions;
    }
    
    // Getters and Setters
    public Double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(Double totalDistance) { this.totalDistance = totalDistance; }
    
    public Double getTotalTime() { return totalTime; }
    public void setTotalTime(Double totalTime) { this.totalTime = totalTime; }
    
    public Integer getAisleCrossings() { return aisleCrossings; }
    public void setAisleCrossings(Integer aisleCrossings) { this.aisleCrossings = aisleCrossings; }
    
    public Integer getTotalTurns() { return totalTurns; }
    public void setTotalTurns(Integer totalTurns) { this.totalTurns = totalTurns; }
    
    public Integer getZoneTransitions() { return zoneTransitions; }
    public void setZoneTransitions(Integer zoneTransitions) { this.zoneTransitions = zoneTransitions; }
    
    public Double getEfficiencyScore() { return efficiencyScore; }
    public void setEfficiencyScore(Double efficiencyScore) { this.efficiencyScore = efficiencyScore; }
    
    public Double getComparedToOptimal() { return comparedToOptimal; }
    public void setComparedToOptimal(Double comparedToOptimal) { this.comparedToOptimal = comparedToOptimal; }
}
