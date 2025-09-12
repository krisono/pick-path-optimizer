package com.nnaemekaonochie.pickpath.route.algorithm;

import com.nnaemekaonochie.pickpath.domain.Location;
import com.nnaemekaonochie.pickpath.route.dto.CostWeights;
import com.nnaemekaonochie.pickpath.route.dto.RouteConstraints;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class OrOptStrategy {
    
    private final CostCalculator costCalculator;
    
    public OrOptStrategy(CostCalculator costCalculator) {
        this.costCalculator = costCalculator;
    }
    
    /**
     * Improve route using Or-opt (relocate segments)
     */
    public List<Location> improveRoute(List<Location> route, CostWeights weights, RouteConstraints constraints) {
        if (route.size() < 4) return route;
        
        List<Location> improved = new ArrayList<>(route);
        boolean improvement = true;
        
        while (improvement) {
            improvement = false;
            
            // Try relocating segments of size 1, 2, and 3
            for (int segmentSize = 1; segmentSize <= Math.min(3, improved.size() - 2); segmentSize++) {
                if (tryRelocateSegment(improved, segmentSize, weights, constraints)) {
                    improvement = true;
                    break;
                }
            }
        }
        
        return improved;
    }
    
    /**
     * Try to relocate a segment of given size to improve the route
     */
    private boolean tryRelocateSegment(List<Location> route, int segmentSize, 
                                     CostWeights weights, RouteConstraints constraints) {
        
        int routeSize = route.size();
        
        for (int i = 1; i < routeSize - segmentSize; i++) {
            // Try inserting segment at each position
            for (int j = 1; j <= routeSize - segmentSize; j++) {
                if (j >= i && j < i + segmentSize) continue; // Skip current position
                
                // Create new route with relocated segment
                List<Location> newRoute = relocateSegment(route, i, segmentSize, j);
                double newCost = calculateRouteCost(newRoute, weights, constraints);
                double oldCost = calculateRouteCost(route, weights, constraints);
                
                if (newCost < oldCost) {
                    // Apply the improvement
                    route.clear();
                    route.addAll(newRoute);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Relocate a segment from one position to another
     */
    private List<Location> relocateSegment(List<Location> route, int fromIndex, 
                                         int segmentSize, int toIndex) {
        
        List<Location> newRoute = new ArrayList<>();
        List<Location> segment = new ArrayList<>(route.subList(fromIndex, fromIndex + segmentSize));
        
        for (int i = 0; i < route.size(); i++) {
            if (i == toIndex) {
                newRoute.addAll(segment);
            }
            
            if (i < fromIndex || i >= fromIndex + segmentSize) {
                newRoute.add(route.get(i));
            }
        }
        
        if (toIndex >= route.size()) {
            newRoute.addAll(segment);
        }
        
        return newRoute;
    }
    
    /**
     * Calculate total route cost
     */
    private double calculateRouteCost(List<Location> route, CostWeights weights, RouteConstraints constraints) {
        double totalCost = 0.0;
        
        for (int i = 0; i < route.size() - 1; i++) {
            totalCost += costCalculator.calculateCost(route.get(i), route.get(i + 1), weights, constraints);
        }
        
        return totalCost;
    }
}
