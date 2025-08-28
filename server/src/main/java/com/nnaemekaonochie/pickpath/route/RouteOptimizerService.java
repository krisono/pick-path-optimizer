package com.nnaemekaonochie.pickpath.route;

import com.nnaemekaonochie.pickpath.domain.*;
import com.nnaemekaonochie.pickpath.repo.*;
import com.nnaemekaonochie.pickpath.route.dto.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RouteOptimizerService {

    private final ItemRepository itemRepo;
    private final InventoryRepository invRepo;
    private final LocationRepository locRepo;

    public RouteOptimizerService(ItemRepository itemRepo, InventoryRepository invRepo, LocationRepository locRepo) {
        this.itemRepo = itemRepo;
        this.invRepo = invRepo;
        this.locRepo = locRepo;
    }

    private static double manhattan(int x1, int y1, int x2, int y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    public OptimizeResponse optimize(OptimizeRequest req) {
        Location start = req.startLocationCode != null
                ? locRepo.findByLocationCode(req.startLocationCode).orElse(null)
                : null;
        int sx = start != null ? start.getX() : 0, sy = start != null ? start.getY() : 0;

        Location end = req.endLocationCode != null
                ? locRepo.findByLocationCode(req.endLocationCode).orElse(null)
                : null;
        int ex = end != null ? end.getX() : sx, ey = end != null ? end.getY() : sy;

        List<Item> items = (req.skus == null ? List.<String>of() : req.skus).stream()
                .map(sku -> itemRepo.findBySku(sku).orElseThrow(() -> new RuntimeException("Unknown SKU: " + sku)))
                .toList();

        List<Inventory> invs = items.stream()
                .map(invRepo::findByItem)
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0)) // pick the first for MVP
                .toList();

        List<int[]> pts = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        pts.add(new int[] { sx, sy });
        labels.add("START");
        for (Inventory inv : invs) {
            Location L = inv.getLocation();
            pts.add(new int[] { L.getX(), L.getY() });
            labels.add(inv.getItem().getSku());
        }
        if (end != null) {
            pts.add(new int[] { ex, ey });
            labels.add("END");
        }

        int n = pts.size();
        if (n <= 1) {
            OptimizeResponse r = new OptimizeResponse();
            r.strategy = "NN+2opt";
            r.orderedStops = List.of();
            r.totalDistance = 0.0;
            return r;
        }

        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = manhattan(pts.get(i)[0], pts.get(i)[1], pts.get(j)[0], pts.get(j)[1]);

        boolean hasEnd = end != null;
        List<Integer> order = new ArrayList<>();
        Set<Integer> unvisited = new HashSet<>();
        for (int i = 1; i < n - (hasEnd ? 1 : 0); i++)
            unvisited.add(i);

        int cur = 0;
        order.add(cur);
        while (!unvisited.isEmpty()) {
            int next = -1;
            double best = Double.POSITIVE_INFINITY;
            for (int candidate : unvisited) {
                if (dist[cur][candidate] < best) {
                    best = dist[cur][candidate];
                    next = candidate;
                }
            }
            order.add(next);
            unvisited.remove(next);
            cur = next;
        }
        if (hasEnd)
            order.add(n - 1);

        TwoOpt.improve(order, dist);

        List<OptimizeResponse.Stop> stops = new ArrayList<>();
        double total = 0.0;
        for (int i = 1; i < order.size(); i++) {
            int prev = order.get(i - 1);
            int idx = order.get(i);
            double leg = dist[prev][idx];
            total += leg;

            OptimizeResponse.Stop s = new OptimizeResponse.Stop();
            s.x = pts.get(idx)[0];
            s.y = pts.get(idx)[1];
            s.legDistance = leg;
            s.cumulativeDistance = total;
            String label = labels.get(idx);

            if ("START".equals(label) || "END".equals(label)) {
                s.locationCode = label;
                s.sku = null;
            } else {
                s.sku = label;
                var inv = invs.stream().filter(iv -> iv.getItem().getSku().equals(label)).findFirst().orElse(null);
                s.locationCode = inv != null ? inv.getLocation().getLocationCode() : "?";
            }
            stops.add(s);
        }
        OptimizeResponse r = new OptimizeResponse();
        r.strategy = "NN+2opt";
        r.orderedStops = stops;
        r.totalDistance = total;
        return r;
    }
}