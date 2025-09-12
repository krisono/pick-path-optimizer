package com.nnaemekaonochie.pickpath.route.algorithm;

import com.nnaemekaonochie.pickpath.domain.Location;
import com.nnaemekaonochie.pickpath.route.dto.CostWeights;
import com.nnaemekaonochie.pickpath.route.dto.RouteConstraints;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class NearestNeighborStrategy {
    
    private final CostCalculator costCalculator;
    
    public NearestNeighborStrategy(CostCalculator costCalculator) {
        this.costCalculator = costCalculator;
    }
    
    /**
     * Generate initial route using Nearest Neighbor heuristic
     */
    public List<Location> generateRoute(Location start, List<Location> pickLocations, 
                                      Location end, CostWeights weights, RouteConstraints constraints) {
        
        List<Location> route = new ArrayList<>();
        Set<Location> unvisited = new HashSet<>(pickLocations);
        Location current = start;
        
        route.add(current);
        
        while (!unvisited.isEmpty()) {
            Location nearest = findNearestLocation(current, unvisited, weights, constraints);
            route.add(nearest);
            unvisited.remove(nearest);
            current = nearest;
        }
        
        // Add end location if different from start
        if (end != null && !end.equals(start)) {
            route.add(end);
        }
        
        return route;
    }
    
    /**
     * Find nearest unvisited location considering constraints
     */
    private Location findNearestLocation(Location current, Set<Location> unvisited, 
                                       CostWeights weights, RouteConstraints constraints) {
        
        Location nearest = null;
        double minCost = Double.MAX_VALUE;
        
        for (Location location : unvisited) {
            if (isLocationAccessible(location, constraints)) {
                double cost = costCalculator.calculateCost(current, location, weights, constraints);
                if (cost < minCost) {
                    minCost = cost;
                    nearest = location;
                }
            }
        }
        
        if (nearest == null && !unvisited.isEmpty()) {
            // Fallback: return first available location if none accessible
            nearest = unvisited.iterator().next();
        }
        
        return nearest;
    }
    
    /**
     * Check if location is accessible given constraints
     */
    private boolean isLocationAccessible(Location location, RouteConstraints constraints) {
        // Basic accessibility check - can be extended
        if (constraints == null) return true;
        
        // Could check time windows, blocked zones, etc.
        return true;
    }
    
    /**
     * Generate route with capacity constraints
     */
    public List<List<Location>> generateCapacityConstrainedRoutes(Location start, 
                                                                List<Location> pickLocations, 
                                                                Location end, 
                                                                CostWeights weights, 
                                                                RouteConstraints constraints) {
        
        List<List<Location>> routes = new ArrayList<>();
        List<Location> remainingLocations = new ArrayList<>(pickLocations);
        
        while (!remainingLocations.isEmpty()) {
            List<Location> currentRoute = new ArrayList<>();
            currentRoute.add(start);
            
            int capacity = constraints != null && constraints.getMaxCapacity() != null 
                         ? constraints.getMaxCapacity() 
                         : Integer.MAX_VALUE;
            
            Location current = start;
            int currentLoad = 0;
            
            while (!remainingLocations.isEmpty() && currentLoad < capacity) {
                Location nearest = findNearestLocation(current, new HashSet<>(remainingLocations), weights, constraints);
                if (nearest != null) {
                    currentRoute.add(nearest);
                    remainingLocations.remove(nearest);
                    current = nearest;
                    currentLoad++;
                }
            }
            
            if (end != null && !end.equals(start)) {
                currentRoute.add(end);
            }
            
            routes.add(currentRoute);
        }
        
        return routes;
    }
}
