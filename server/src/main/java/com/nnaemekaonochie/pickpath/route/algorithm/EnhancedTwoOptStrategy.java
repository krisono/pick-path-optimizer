package com.nnaemekaonochie.pickpath.route.algorithm;

import com.nnaemekaonochie.pickpath.domain.Location;
import com.nnaemekaonochie.pickpath.route.dto.CostWeights;
import com.nnaemekaonochie.pickpath.route.dto.RouteConstraints;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class EnhancedTwoOptStrategy {
    
    private final CostCalculator costCalculator;
    
    public EnhancedTwoOptStrategy(CostCalculator costCalculator) {
        this.costCalculator = costCalculator;
    }
    
    /**
     * Improve route using enhanced 2-opt with warehouse-aware costs
     */
    public List<Location> improveRoute(List<Location> route, CostWeights weights, RouteConstraints constraints) {
        if (route.size() < 4) return route;
        
        List<Location> improved = new ArrayList<>(route);
        boolean improvement = true;
        int iterations = 0;
        int maxIterations = 1000;
        
        while (improvement && iterations < maxIterations) {
            improvement = false;
            iterations++;
            
            for (int i = 1; i < improved.size() - 2; i++) {
                for (int k = i + 1; k < improved.size() - 1; k++) {
                    if (twoOptImproves(improved, i, k, weights, constraints)) {
                        performTwoOptSwap(improved, i, k);
                        improvement = true;
                    }
                }
            }
        }
        
        return improved;
    }
    
    /**
     * Check if 2-opt swap improves the route
     */
    private boolean twoOptImproves(List<Location> route, int i, int k, 
                                 CostWeights weights, RouteConstraints constraints) {
        
        Location a = route.get(i - 1);
        Location b = route.get(i);
        Location c = route.get(k);
        Location d = route.get(k + 1);
        
        // Calculate current cost
        double currentCost = costCalculator.calculateCost(a, b, weights, constraints) + 
                           costCalculator.calculateCost(c, d, weights, constraints);
        
        // Calculate cost after swap
        double newCost = costCalculator.calculateCost(a, c, weights, constraints) + 
                        costCalculator.calculateCost(b, d, weights, constraints);
        
        return newCost < currentCost - 1e-9; // Small epsilon for floating point comparison
    }
    
    /**
     * Perform 2-opt swap by reversing the order of cities between i and k
     */
    private void performTwoOptSwap(List<Location> route, int i, int k) {
        while (i < k) {
            Collections.swap(route, i, k);
            i++;
            k--;
        }
    }
    
    /**
     * Optimize route using 2-opt with random restarts
     */
    public List<Location> optimizeWithRestarts(List<Location> route, CostWeights weights, 
                                             RouteConstraints constraints, int restarts) {
        
        List<Location> bestRoute = improveRoute(new ArrayList<>(route), weights, constraints);
        double bestCost = calculateRouteCost(bestRoute, weights, constraints);
        
        Random random = new Random();
        
        for (int restart = 0; restart < restarts; restart++) {
            // Create a shuffled version of the route (keeping start/end fixed)
            List<Location> shuffledRoute = new ArrayList<>(route);
            if (shuffledRoute.size() > 2) {
                List<Location> middle = shuffledRoute.subList(1, shuffledRoute.size() - 1);
                Collections.shuffle(middle, random);
            }
            
            // Improve the shuffled route
            List<Location> improvedRoute = improveRoute(shuffledRoute, weights, constraints);
            double improvedCost = calculateRouteCost(improvedRoute, weights, constraints);
            
            if (improvedCost < bestCost) {
                bestRoute = improvedRoute;
                bestCost = improvedCost;
            }
        }
        
        return bestRoute;
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
