package com.nnaemekaonochie.pickpath.config;

import com.nnaemekaonochie.pickpath.domain.*;
import com.nnaemekaonochie.pickpath.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.*;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner seed(LocationRepository locRepo, ItemRepository itemRepo, InventoryRepository invRepo) {
        return args -> {
            if (locRepo.count() > 0)
                return;

            // simple grid: aisles A01..A03; bays B01..B10
            List<Location> locations = new ArrayList<>();
            for (int aisle = 1; aisle <= 3; aisle++) {
                int y = aisle * 10;
                for (int bay = 1; bay <= 10; bay++) {
                    int x = bay * 10;
                    String code = "A%02d-B%02d-L1".formatted(aisle, bay);
                    locations.add(
                            new Location(code, x, y, "Z1", "A%02d".formatted(aisle), "B%02d".formatted(bay), "L1"));
                }
            }
            locRepo.saveAll(locations);

            Item i1 = itemRepo.save(new Item("SKU-APPLE", "Apples 3lb"));
            Item i2 = itemRepo.save(new Item("SKU-RICE", "Rice 5lb"));
            Item i3 = itemRepo.save(new Item("SKU-MILK", "Milk 1gal"));
            Item i4 = itemRepo.save(new Item("SKU-BREAD", "Bread Loaf"));
            Item i5 = itemRepo.save(new Item("SKU-PASTA", "Pasta 1lb"));

            Map<String, String> map = Map.of(
                    i1.getSku(), "A01-B03-L1",
                    i2.getSku(), "A02-B08-L1",
                    i3.getSku(), "A03-B02-L1",
                    i4.getSku(), "A01-B09-L1",
                    i5.getSku(), "A03-B07-L1");
            for (var e : map.entrySet()) {
                Item item = itemRepo.findBySku(e.getKey()).orElseThrow();
                Location loc = locRepo.findByLocationCode(e.getValue()).orElseThrow();
                invRepo.save(new Inventory(item, loc));
            }
        };
    }
}