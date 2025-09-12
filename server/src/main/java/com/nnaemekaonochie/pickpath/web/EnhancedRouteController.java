package com.nnaemekaonochie.pickpath.web;

import com.nnaemekaonochie.pickpath.route.EnhancedRouteOptimizerService;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeRequest;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EnhancedRouteController {

    private final EnhancedRouteOptimizerService optimizerService;

    public EnhancedRouteController(EnhancedRouteOptimizerService optimizerService) {
        this.optimizerService = optimizerService;
    }

    @PostMapping("/optimize")
    public ResponseEntity<OptimizeResponse> optimizeRoute(@RequestBody OptimizeRequest request) {
        try {
            OptimizeResponse response = optimizerService.optimize(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/strategies")
    public ResponseEntity<StrategyInfo[]> getAvailableStrategies() {
        StrategyInfo[] strategies = {
            new StrategyInfo("nearest_neighbor", "Nearest Neighbor", 
                           "Fast greedy algorithm, good for small orders"),
            new StrategyInfo("enhanced_two_opt", "Enhanced 2-Opt", 
                           "Balanced performance with warehouse-aware improvements"),
            new StrategyInfo("or_opt", "Or-Opt", 
                           "Local search with segment relocation"),
            new StrategyInfo("hybrid", "Hybrid Multi-Strategy", 
                           "Tries multiple approaches and selects the best result")
        };
        return ResponseEntity.ok(strategies);
    }

    @GetMapping("/health")
    public ResponseEntity<HealthCheck> healthCheck() {
        return ResponseEntity.ok(new HealthCheck("OK", "Route optimization service is running"));
    }

    // Helper classes
    public static class StrategyInfo {
        public String id;
        public String name;
        public String description;

        public StrategyInfo(String id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
        }
    }

    public static class HealthCheck {
        public String status;
        public String message;

        public HealthCheck(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}
