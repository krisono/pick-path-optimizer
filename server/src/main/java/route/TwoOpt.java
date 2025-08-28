package com.nnaemekaonochie.pickpath.route;

import java.util.List;

public class TwoOpt {
    public static void improve(List<Integer> order, double[][] dist) {
        boolean improved = true;
        int n = order.size();
        if (n < 4)
            return;

        while (improved) {
            improved = false;
            for (int i = 1; i < n - 2; i++) {
                for (int k = i + 1; k < n - 1; k++) {
                    int a = order.get(i - 1), b = order.get(i);
                    int c = order.get(k), d = order.get(k + 1);
                    double delta = (dist[a][c] + dist[b][d]) - (dist[a][b] + dist[c][d]);
                    if (delta < -1e-9) {
                        for (int l = i, r = k; l < r; l++, r--) {
                            int tmp = order.get(l);
                            order.set(l, order.get(r));
                            order.set(r, tmp);
                        }
                        improved = true;
                    }
                }
            }
        }
    }
}