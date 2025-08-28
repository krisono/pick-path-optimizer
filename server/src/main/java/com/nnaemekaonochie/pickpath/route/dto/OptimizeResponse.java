package com.nnaemekaonochie.pickpath.route.dto;

import java.util.List;

public class OptimizeResponse {
    public static class Stop {
        public String locationCode;
        public int x, y;
        public String sku;
        public double legDistance;
        public double cumulativeDistance;
    }

    public List<Stop> orderedStops;
    public double totalDistance;
    public String strategy;
}