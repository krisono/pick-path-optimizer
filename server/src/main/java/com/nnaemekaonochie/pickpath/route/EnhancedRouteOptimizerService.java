package com.nnaemekaonochie.pickpath.route;

import com.nnaemekaonochie.pickpath.domain.*;
import com.nnaemekaonochie.pickpath.repo.*;
import com.nnaemekaonochie.pickpath.route.algorithm.*;
import com.nnaemekaonochie.pickpath.route.dto.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnhancedRouteOptimizerService {

    private final ItemRepository itemRepo;
    private final InventoryRepository invRepo;
    private final LocationRepository locRepo;
    private final CostCalculator costCalculator;
    private final NearestNeighborStrategy nearestNeighborStrategy;
    private final EnhancedTwoOptStrategy enhancedTwoOptStrategy;
    private final OrOptStrategy orOptStrategy;

    public EnhancedRouteOptimizerService(ItemRepository itemRepo, 
                                       InventoryRepository invRepo, 
                                       LocationRepository locRepo,
                                       CostCalculator costCalculator,
                                       NearestNeighborStrategy nearestNeighborStrategy,
                                       EnhancedTwoOptStrategy enhancedTwoOptStrategy,
                                       OrOptStrategy orOptStrategy) {
        this.itemRepo = itemRepo;
        this.invRepo = invRepo;
        this.locRepo = locRepo;
        this.costCalculator = costCalculator;
        this.nearestNeighborStrategy = nearestNeighborStrategy;
        this.enhancedTwoOptStrategy = enhancedTwoOptStrategy;
        this.orOptStrategy = orOptStrategy;
    }

    /**
     * Main optimization method with enhanced features
     */
    public OptimizeResponse optimize(OptimizeRequest req) {
        // Set defaults
        if (req.strategy == null) req.strategy = "enhanced_two_opt";
        if (req.weights == null) req.weights = new CostWeights();
        
        // Get start and end locations
        Location start = getLocationOrDefault(req.startLocationCode, 0, 0);
        Location end = getLocationOrDefault(req.endLocationCode, start.getX(), start.getY());

        // Get items and their locations
        List<Item> items = getItemsFromSkus(req.skus);
        List<Location> pickLocations = getPickLocationsFromItems(items);
        
        if (pickLocations.isEmpty()) {
            return createEmptyResponse(req.strategy);
        }

        // Generate optimized route
        List<Location> optimizedRoute = generateOptimizedRoute(
            start, pickLocations, end, req.strategy, req.weights, req.constraints);

        // Create enhanced response
        return createEnhancedResponse(optimizedRoute, items, req.strategy, req.weights, req.constraints);
    }

    /**
     * Generate optimized route based on strategy
     */
    private List<Location> generateOptimizedRoute(Location start, List<Location> pickLocations, 
                                                 Location end, String strategy, 
                                                 CostWeights weights, RouteConstraints constraints) {
        
        List<Location> route;
        
        switch (strategy.toLowerCase()) {
            case "nearest_neighbor":
                route = nearestNeighborStrategy.generateRoute(start, pickLocations, end, weights, constraints);
                break;
                
            case "enhanced_two_opt":
                // Start with nearest neighbor, then improve with 2-opt
                route = nearestNeighborStrategy.generateRoute(start, pickLocations, end, weights, constraints);
                route = enhancedTwoOptStrategy.improveRoute(route, weights, constraints);
                break;
                
            case "or_opt":
                // Start with nearest neighbor, then improve with or-opt
                route = nearestNeighborStrategy.generateRoute(start, pickLocations, end, weights, constraints);
                route = orOptStrategy.improveRoute(route, weights, constraints);
                break;
                
            case "hybrid":
                // Use multiple strategies and pick the best
                route = optimizeWithMultipleStrategies(start, pickLocations, end, weights, constraints);
                break;
                
            default:
                route = nearestNeighborStrategy.generateRoute(start, pickLocations, end, weights, constraints);
        }
        
        return route;
    }

    /**
     * Try multiple strategies and return the best result
     */
    private List<Location> optimizeWithMultipleStrategies(Location start, List<Location> pickLocations, 
                                                         Location end, CostWeights weights, 
                                                         RouteConstraints constraints) {
        
        List<Location> bestRoute = null;
        double bestCost = Double.MAX_VALUE;
        
        // Try different strategies
        String[] strategies = {"nearest_neighbor", "enhanced_two_opt", "or_opt"};
        
        for (String strategy : strategies) {
            List<Location> route = generateOptimizedRoute(start, pickLocations, end, strategy, weights, constraints);
            double cost = calculateRouteCost(route, weights, constraints);
            
            if (cost < bestCost) {
                bestCost = cost;
                bestRoute = route;
            }
        }
        
        return bestRoute != null ? bestRoute : nearestNeighborStrategy.generateRoute(start, pickLocations, end, weights, constraints);
    }

    /**
     * Create enhanced response with detailed metrics
     */
    private OptimizeResponse createEnhancedResponse(List<Location> route, List<Item> items, 
                                                   String strategy, CostWeights weights, 
                                                   RouteConstraints constraints) {
        
        List<EnhancedRouteStop> stops = new ArrayList<>();
        double cumulativeDistance = 0.0;
        double cumulativeTime = 0.0;
        int totalTurns = 0;
        int totalAisleCrossings = 0;
        int totalZoneTransitions = 0;
        
        Map<String, String> locationToSku = createLocationToSkuMap(items);
        
        for (int i = 0; i < route.size(); i++) {
            Location location = route.get(i);
            String sku = locationToSku.get(location.getLocationCode());
            
            double legDistance = 0.0;
            double legTime = 0.0;
            int aisleCrossings = 0;
            int turns = 0;
            List<String> zoneTransitions = new ArrayList<>();
            
            if (i > 0) {
                Location prevLocation = route.get(i - 1);
                legDistance = costCalculator.manhattanDistance(
                    prevLocation.getX(), prevLocation.getY(),
                    location.getX(), location.getY());
                
                legTime = costCalculator.estimateTime(legDistance, sku != null ? 1 : 0);
                
                // Calculate aisle crossings
                if (!Objects.equals(prevLocation.getAisle(), location.getAisle())) {
                    aisleCrossings = 1;
                    totalAisleCrossings++;
                }
                
                // Calculate zone transitions
                if (!Objects.equals(prevLocation.getZone(), location.getZone())) {
                    zoneTransitions.add(prevLocation.getZone() + " -> " + location.getZone());
                    totalZoneTransitions++;
                }
                
                // Calculate turns
                if (i > 1) {
                    Location prevPrevLocation = route.get(i - 2);
                    double turnPenalty = costCalculator.calculateTurnPenalty(prevPrevLocation, prevLocation, location, weights);
                    if (turnPenalty > 0) {
                        turns = 1;
                        totalTurns++;
                    }
                }
            }
            
            cumulativeDistance += legDistance;
            cumulativeTime += legTime;
            
            EnhancedRouteStop stop = new EnhancedRouteStop(
                i + 1, location.getLocationCode(), sku,
                location.getX(), location.getY(), legDistance, cumulativeDistance);
            
            stop.setEstimatedTime(legTime);
            stop.setAisleCrossings(aisleCrossings);
            stop.setTurns(turns);
            stop.setZoneTransitions(zoneTransitions);
            stop.setActions(sku != null ? Arrays.asList("pick", "scan") : Arrays.asList("traverse"));
            
            stops.add(stop);
        }
        
        // Create metrics
        RouteMetrics metrics = new RouteMetrics(
            cumulativeDistance, cumulativeTime, totalAisleCrossings, 
            totalTurns, totalZoneTransitions);
        
        // Calculate efficiency score (simplified)
        double theoreticalOptimal = calculateTheoreticalOptimal(route);
        double efficiencyScore = costCalculator.calculateEfficiencyScore(cumulativeDistance, theoreticalOptimal);
        metrics.setEfficiencyScore(efficiencyScore);
        metrics.setComparedToOptimal((cumulativeDistance / theoreticalOptimal - 1.0) * 100);
        
        // Create response
        OptimizeResponse response = new OptimizeResponse();
        response.orderedStops = stops.stream()
            .map(this::convertToLegacyStop)
            .collect(Collectors.toList());
        response.totalDistance = cumulativeDistance;
        response.strategy = strategy;
        
        return response;
    }

    /**
     * Helper methods
     */
    private Location getLocationOrDefault(String locationCode, int defaultX, int defaultY) {
        if (locationCode != null) {
            return locRepo.findByLocationCode(locationCode).orElse(createDefaultLocation(defaultX, defaultY));
        }
        return createDefaultLocation(defaultX, defaultY);
    }

    private Location createDefaultLocation(int x, int y) {
        Location location = new Location();
        location.setLocationCode("DEFAULT");
        location.setX(x);
        location.setY(y);
        location.setZone("DEFAULT");
        location.setAisle("DEFAULT");
        return location;
    }

    private List<Item> getItemsFromSkus(List<String> skus) {
        if (skus == null) return new ArrayList<>();
        
        return skus.stream()
            .map(sku -> itemRepo.findBySku(sku).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    private List<Location> getPickLocationsFromItems(List<Item> items) {
        return items.stream()
            .map(invRepo::findByItem)
            .filter(list -> !list.isEmpty())
            .map(list -> list.get(0).getLocation())
            .collect(Collectors.toList());
    }

    private Map<String, String> createLocationToSkuMap(List<Item> items) {
        Map<String, String> map = new HashMap<>();
        for (Item item : items) {
            List<Inventory> inventories = invRepo.findByItem(item);
            if (!inventories.isEmpty()) {
                map.put(inventories.get(0).getLocation().getLocationCode(), item.getSku());
            }
        }
        return map;
    }

    private double calculateRouteCost(List<Location> route, CostWeights weights, RouteConstraints constraints) {
        double totalCost = 0.0;
        for (int i = 0; i < route.size() - 1; i++) {
            totalCost += costCalculator.calculateCost(route.get(i), route.get(i + 1), weights, constraints);
        }
        return totalCost;
    }

    private double calculateTheoreticalOptimal(List<Location> route) {
        // Simplified: assume optimal is 80% of current distance
        double currentDistance = 0.0;
        for (int i = 0; i < route.size() - 1; i++) {
            currentDistance += costCalculator.manhattanDistance(
                route.get(i).getX(), route.get(i).getY(),
                route.get(i + 1).getX(), route.get(i + 1).getY());
        }
        return currentDistance * 0.8;
    }

    private OptimizeResponse.Stop convertToLegacyStop(EnhancedRouteStop enhancedStop) {
        OptimizeResponse.Stop stop = new OptimizeResponse.Stop();
        stop.locationCode = enhancedStop.getLocationCode();
        stop.sku = enhancedStop.getSku();
        stop.x = enhancedStop.getX();
        stop.y = enhancedStop.getY();
        stop.legDistance = enhancedStop.getLegDistance();
        stop.cumulativeDistance = enhancedStop.getCumulativeDistance();
        return stop;
    }

    private OptimizeResponse createEmptyResponse(String strategy) {
        OptimizeResponse response = new OptimizeResponse();
        response.orderedStops = new ArrayList<>();
        response.totalDistance = 0.0;
        response.strategy = strategy;
        return response;
    }
}
