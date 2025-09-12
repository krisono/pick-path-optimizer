package com.nnaemekaonochie.pickpath.route.dto;

public class CostWeights {
    
    private Double distanceWeight = 1.0;
    private Double aisleCrossingPenalty = 5.0;
    private Double turnPenalty = 2.0;
    private Double blockedZonePenalty = 100.0;
    private Double capacityViolationPenalty = 50.0;
    
    // Constructors
    public CostWeights() {}
    
    public CostWeights(Double distanceWeight, Double aisleCrossingPenalty, 
                      Double turnPenalty, Double blockedZonePenalty, 
                      Double capacityViolationPenalty) {
        this.distanceWeight = distanceWeight;
        this.aisleCrossingPenalty = aisleCrossingPenalty;
        this.turnPenalty = turnPenalty;
        this.blockedZonePenalty = blockedZonePenalty;
        this.capacityViolationPenalty = capacityViolationPenalty;
    }
    
    // Getters and Setters
    public Double getDistanceWeight() { return distanceWeight; }
    public void setDistanceWeight(Double distanceWeight) { this.distanceWeight = distanceWeight; }
    
    public Double getAisleCrossingPenalty() { return aisleCrossingPenalty; }
    public void setAisleCrossingPenalty(Double aisleCrossingPenalty) { this.aisleCrossingPenalty = aisleCrossingPenalty; }
    
    public Double getTurnPenalty() { return turnPenalty; }
    public void setTurnPenalty(Double turnPenalty) { this.turnPenalty = turnPenalty; }
    
    public Double getBlockedZonePenalty() { return blockedZonePenalty; }
    public void setBlockedZonePenalty(Double blockedZonePenalty) { this.blockedZonePenalty = blockedZonePenalty; }
    
    public Double getCapacityViolationPenalty() { return capacityViolationPenalty; }
    public void setCapacityViolationPenalty(Double capacityViolationPenalty) { this.capacityViolationPenalty = capacityViolationPenalty; }
}
