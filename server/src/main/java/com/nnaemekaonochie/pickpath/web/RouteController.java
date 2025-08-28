package com.nnaemekaonochie.pickpath.web;

import com.nnaemekaonochie.pickpath.route.RouteOptimizerService;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeRequest;
import com.nnaemekaonochie.pickpath.route.dto.OptimizeResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RouteController {
    private final RouteOptimizerService svc;

    public RouteController(RouteOptimizerService svc) {
        this.svc = svc;
    }

    @PostMapping(value = "/optimize", consumes = MediaType.APPLICATION_JSON_VALUE)
    public OptimizeResponse optimize(@RequestBody OptimizeRequest req) {
        return svc.optimize(req);
    }
}