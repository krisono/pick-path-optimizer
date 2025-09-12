package com.nnaemekaonochie.pickpath.route.dto;

import java.util.List;

public class OptimizeRequest {
    public String startLocationCode; // optional; default (0,0)
    public String endLocationCode; // optional
    public List<String> skus; // required
    public String strategy = "enhanced_two_opt"; // optimization strategy
    public RouteConstraints constraints; // capacity, time constraints
    public CostWeights weights; // penalty weights
    public String pickerId; // specific picker assignment
}