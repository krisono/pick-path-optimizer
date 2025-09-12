package com.nnaemekaonochie.pickpath.route.algorithm;

import com.nnaemekaonochie.pickpath.domain.Location;
import com.nnaemekaonochie.pickpath.route.dto.CostWeights;
import com.nnaemekaonochie.pickpath.route.dto.RouteConstraints;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class CostCalculator {
    
    /**
     * Calculate total cost between two locations including penalties
     */
    public double calculateCost(Location from, Location to, CostWeights weights, RouteConstraints constraints) {
        if (weights == null) {
            weights = new CostWeights();
        }
        
        double baseCost = manhattanDistance(from.getX(), from.getY(), to.getX(), to.getY());
        double totalCost = baseCost * weights.getDistanceWeight();
        
        // Aisle crossing penalty
        if (!Objects.equals(from.getAisle(), to.getAisle())) {
            totalCost += weights.getAisleCrossingPenalty();
        }
        
        // Zone transition penalty (if different zones)
        if (!Objects.equals(from.getZone(), to.getZone())) {
            totalCost += weights.getTurnPenalty();
        }
        
        // Blocked zone penalty (simplified - would need layout data)
        if (constraints != null && constraints.getAvoidBlockedZones()) {
            totalCost += calculateBlockedZonePenalty(from, to, weights);
        }
        
        return totalCost;
    }
    
    /**
     * Calculate Manhattan distance between two points
     */
    public double manhattanDistance(int x1, int y1, int x2, int y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    /**
     * Calculate turn penalty based on direction changes
     */
    public double calculateTurnPenalty(Location prev, Location current, Location next, CostWeights weights) {
        if (prev == null || next == null) return 0.0;
        
        // Calculate vectors
        int dx1 = current.getX() - prev.getX();
        int dy1 = current.getY() - prev.getY();
        int dx2 = next.getX() - current.getX();
        int dy2 = next.getY() - current.getY();
        
        // Check if direction changes (turn)
        if (dx1 != dx2 || dy1 != dy2) {
            return weights.getTurnPenalty();
        }
        
        return 0.0;
    }
    
    /**
     * Calculate blocked zone penalty (placeholder implementation)
     */
    private double calculateBlockedZonePenalty(Location from, Location to, CostWeights weights) {
        // In a real implementation, this would check against a layout map
        // For now, return 0 as we don't have blocked zone data
        return 0.0;
    }
    
    /**
     * Calculate efficiency score (0-1, where 1 is optimal)
     */
    public double calculateEfficiencyScore(double actualDistance, double theoreticalOptimal) {
        if (actualDistance <= 0 || theoreticalOptimal <= 0) return 0.0;
        return Math.min(1.0, theoreticalOptimal / actualDistance);
    }
    
    /**
     * Estimate time based on distance and picking operations
     */
    public double estimateTime(double distance, int pickOperations) {
        // Assumptions: 3 units/minute walking speed, 0.5 minutes per pick
        double walkingTime = distance / 3.0;
        double pickingTime = pickOperations * 0.5;
        return walkingTime + pickingTime;
    }
}
