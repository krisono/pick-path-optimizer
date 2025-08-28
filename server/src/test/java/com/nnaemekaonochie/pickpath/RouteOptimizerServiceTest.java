package com.nnaemekaonochie.pickpath;

import com.nnaemekaonochie.pickpath.route.RouteOptimizerService;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeRequest;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class RouteOptimizerServiceTest {

    @Autowired
    RouteOptimizerService svc;

    @Test
    void basicOptimize() {
        OptimizeRequest req = new OptimizeRequest();
        req.skus = java.util.List.of("SKU-APPLE", "SKU-RICE", "SKU-MILK");

        OptimizeResponse res = svc.optimize(req);
        assertThat(res.orderedStops).isNotEmpty();
        assertThat(res.totalDistance).isGreaterThan(0.0);
    }
}