package com.nnaemekaonochie.pickpath.route;

import com.nnaemekaonochie.pickpath.route.dto.OptimizeRequest;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeResponse;
import com.nnaemekaonochie.pickpath.route.dto.CostWeights;
import com.nnaemekaonochie.pickpath.route.dto.RouteConstraints;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class EnhancedRouteOptimizerServiceTest {

    @Autowired
    EnhancedRouteOptimizerService enhancedService;

    @Test
    void testBasicOptimization() {
        OptimizeRequest req = new OptimizeRequest();
        req.skus = List.of("SKU-APPLE", "SKU-RICE", "SKU-MILK");
        req.strategy = "enhanced_two_opt";

        OptimizeResponse res = enhancedService.optimize(req);
        
        assertThat(res.orderedStops).isNotEmpty();
        assertThat(res.totalDistance).isGreaterThan(0.0);
        assertThat(res.strategy).isEqualTo("enhanced_two_opt");
    }

    @Test
    void testOptimizationWithConstraints() {
        OptimizeRequest req = new OptimizeRequest();
        req.skus = List.of("SKU-APPLE", "SKU-RICE", "SKU-MILK", "SKU-BREAD", "SKU-PASTA");
        req.strategy = "nearest_neighbor";
        
        // Add constraints
        req.constraints = new RouteConstraints();
        req.constraints.setMaxCapacity(3);
        req.constraints.setMaxTimeMinutes(30);
        
        // Add cost weights
        req.weights = new CostWeights();
        req.weights.setAisleCrossingPenalty(10.0);
        req.weights.setTurnPenalty(3.0);

        OptimizeResponse res = enhancedService.optimize(req);
        
        assertThat(res.orderedStops).isNotEmpty();
        assertThat(res.totalDistance).isGreaterThan(0.0);
    }

    @Test
    void testMultipleStrategies() {
        OptimizeRequest req = new OptimizeRequest();
        req.skus = List.of("SKU-APPLE", "SKU-RICE", "SKU-MILK");
        
        String[] strategies = {"nearest_neighbor", "enhanced_two_opt", "or_opt", "hybrid"};
        
        for (String strategy : strategies) {
            req.strategy = strategy;
            OptimizeResponse res = enhancedService.optimize(req);
            
            assertThat(res.orderedStops).isNotEmpty();
            assertThat(res.totalDistance).isGreaterThan(0.0);
            assertThat(res.strategy).isEqualTo(strategy);
        }
    }

    @Test
    void testEmptySkuList() {
        OptimizeRequest req = new OptimizeRequest();
        req.skus = List.of();
        req.strategy = "enhanced_two_opt";

        OptimizeResponse res = enhancedService.optimize(req);
        
        assertThat(res.orderedStops).isEmpty();
        assertThat(res.totalDistance).isEqualTo(0.0);
    }
}
