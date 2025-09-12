package com.nnaemekaonochie.pickpath.config;

import com.nnaemekaonochie.pickpath.domain.*;
import com.nnaemekaonochie.pickpath.repo.*;
import org.springframework.boot.CommandLineRunner;
import java.util.*;

//@Configuration  // Disabled in favor of simpler DataLoader
public class EnhancedDataLoader {

    //@Bean  // Disabled
    CommandLineRunner seedEnhancedWarehouse(LocationRepository locRepo, ItemRepository itemRepo, 
                                           InventoryRepository invRepo) {
        return args -> {
            // Only load data if database is empty
            if (locRepo.count() > 0) {
                System.out.println("Data already exists, skipping data loading.");
                return;
            }

            // Create a more realistic warehouse layout
            List<Location> locations = new ArrayList<>();
            
            // Receiving Zone (0-20, 0-30)
            createZoneLocations(locations, "RECEIVING", "R", 0, 20, 0, 30, 5);
            
            // Main picking aisles - 6 aisles with different heights
            // Aisle A (grocery) - 100 locations
            createAisleLocations(locations, "A", "GROCERY", 30, 130, 10, 10);
            createAisleLocations(locations, "A", "GROCERY", 30, 130, 20, 20);
            
            // Aisle B (frozen) - 80 locations  
            createAisleLocations(locations, "B", "FROZEN", 30, 110, 35, 35);
            createAisleLocations(locations, "B", "FROZEN", 30, 110, 45, 45);
            
            // Aisle C (produce) - 60 locations
            createAisleLocations(locations, "C", "PRODUCE", 30, 90, 60, 60);
            createAisleLocations(locations, "C", "PRODUCE", 30, 90, 70, 70);
            
            // Aisle D (dairy) - 80 locations
            createAisleLocations(locations, "D", "DAIRY", 30, 110, 85, 85);
            createAisleLocations(locations, "D", "DAIRY", 30, 110, 95, 95);
            
            // Aisle E (bakery) - 60 locations
            createAisleLocations(locations, "E", "BAKERY", 30, 90, 110, 110);
            createAisleLocations(locations, "E", "BAKERY", 30, 90, 120, 120);
            
            // Aisle F (household) - 100 locations
            createAisleLocations(locations, "F", "HOUSEHOLD", 30, 130, 135, 135);
            createAisleLocations(locations, "F", "HOUSEHOLD", 30, 130, 145, 145);
            
            // Shipping/Packing zones (150-180, 0-160)
            createZoneLocations(locations, "PACKING", "P", 150, 180, 0, 50, 10);
            createZoneLocations(locations, "SHIPPING", "S", 150, 180, 60, 160, 15);
            
            locRepo.saveAll(locations);
            System.out.println("Created " + locations.size() + " locations");

            // Create diverse inventory with realistic SKUs
            createRealisticInventory(itemRepo, invRepo, locRepo);
        };
    }
    
    private void createZoneLocations(List<Location> locations, String zoneName, String prefix, 
                                   int xStart, int xEnd, int yStart, int yEnd, int spacing) {
        int locNum = 1;
        for (int x = xStart; x <= xEnd; x += spacing) {
            for (int y = yStart; y <= yEnd; y += spacing) {
                String code = "%s%03d".formatted(prefix, locNum++);
                locations.add(new Location(code, x, y, zoneName, prefix + "-ZONE", 
                                         "BAY-%02d".formatted((x - xStart) / spacing + 1), "L1"));
            }
        }
    }
    
    private void createAisleLocations(List<Location> locations, String aisleLetter, String zone,
                                    int xStart, int xEnd, int y1, int y2) {
        int bay = 1;
        for (int x = xStart; x <= xEnd; x += 5) {
            // Left side of aisle
            String code1 = "%s%02d-B%02d-L1".formatted(aisleLetter, bay, 1);
            locations.add(new Location(code1, x, y1, zone, aisleLetter, 
                                     "B%02d".formatted(bay), "L1"));
            
            // Right side of aisle
            String code2 = "%s%02d-B%02d-L2".formatted(aisleLetter, bay, 2);
            locations.add(new Location(code2, x, y2, zone, aisleLetter, 
                                     "B%02d".formatted(bay), "L2"));
            bay++;
        }
    }
    
    private void createRealisticInventory(ItemRepository itemRepo, InventoryRepository invRepo, 
                                        LocationRepository locRepo) {
        
        // Grocery items (Aisle A)
        Map<String, String> groceryItems = Map.of(
            "SKU-APPLE", "Organic Apples 3lb",
            "SKU-RICE", "Jasmine Rice 5lb",
            "SKU-PASTA", "Whole Wheat Pasta 1lb",
            "SKU-SAUCE", "Marinara Sauce 24oz",
            "SKU-CEREAL", "Organic Granola 16oz",
            "SKU-COFFEE", "Fair Trade Coffee 12oz",
            "SKU-TEA", "Green Tea Bags 20ct",
            "SKU-HONEY", "Raw Honey 16oz",
            "SKU-NUTS", "Mixed Nuts 8oz",
            "SKU-DRIED-FRUIT", "Dried Cranberries 6oz"
        );
        
        // Frozen items (Aisle B)
        Map<String, String> frozenItems = Map.of(
            "SKU-ICE-CREAM", "Vanilla Ice Cream 1qt",
            "SKU-FROZEN-VEG", "Frozen Broccoli 12oz",
            "SKU-FROZEN-PIZZA", "Margherita Pizza 10in",
            "SKU-FROZEN-BERRIES", "Mixed Berries 10oz",
            "SKU-FROZEN-FISH", "Salmon Fillets 1lb"
        );
        
        // Produce items (Aisle C)
        Map<String, String> produceItems = Map.of(
            "SKU-BANANAS", "Organic Bananas 2lb",
            "SKU-CARROTS", "Baby Carrots 1lb",
            "SKU-SPINACH", "Fresh Spinach 5oz",
            "SKU-TOMATOES", "Roma Tomatoes 1lb",
            "SKU-AVOCADOS", "Hass Avocados 4ct"
        );
        
        // Dairy items (Aisle D)
        Map<String, String> dairyItems = Map.of(
            "SKU-MILK", "Organic Milk 1gal",
            "SKU-CHEESE", "Sharp Cheddar 8oz",
            "SKU-YOGURT", "Greek Yogurt 32oz",
            "SKU-BUTTER", "Unsalted Butter 1lb",
            "SKU-EGGS", "Free Range Eggs 12ct"
        );
        
        // Bakery items (Aisle E)
        Map<String, String> bakeryItems = Map.of(
            "SKU-BREAD", "Sourdough Loaf",
            "SKU-BAGELS", "Everything Bagels 6ct",
            "SKU-MUFFINS", "Blueberry Muffins 4ct",
            "SKU-CROISSANTS", "Butter Croissants 4ct"
        );
        
        // Household items (Aisle F)
        Map<String, String> householdItems = Map.of(
            "SKU-DETERGENT", "Laundry Detergent 32oz",
            "SKU-SOAP", "Hand Soap 3pk",
            "SKU-TISSUES", "Facial Tissues 3pk",
            "SKU-TOILET-PAPER", "Toilet Paper 12pk",
            "SKU-PAPER-TOWELS", "Paper Towels 6pk"
        );
        
        // Create and place items
        placeItemsInAisle(itemRepo, invRepo, locRepo, groceryItems, "A");
        placeItemsInAisle(itemRepo, invRepo, locRepo, frozenItems, "B");
        placeItemsInAisle(itemRepo, invRepo, locRepo, produceItems, "C");
        placeItemsInAisle(itemRepo, invRepo, locRepo, dairyItems, "D");
        placeItemsInAisle(itemRepo, invRepo, locRepo, bakeryItems, "E");
        placeItemsInAisle(itemRepo, invRepo, locRepo, householdItems, "F");
    }
    
    private void placeItemsInAisle(ItemRepository itemRepo, InventoryRepository invRepo,
                                 LocationRepository locRepo, Map<String, String> items, 
                                 String aisle) {
        
        List<Location> aisleLocations = locRepo.findAll().stream()
            .filter(loc -> loc.getAisle().equals(aisle))
            .toList();
        
        if (aisleLocations.isEmpty()) return;
        
        Random random = new Random(42); // Fixed seed for reproducible results
        List<Location> shuffledLocations = new ArrayList<>(aisleLocations);
        Collections.shuffle(shuffledLocations, random);
        
        int locationIndex = 0;
        for (Map.Entry<String, String> entry : items.entrySet()) {
            Item item = itemRepo.save(new Item(entry.getKey(), entry.getValue()));
            
            if (locationIndex < shuffledLocations.size()) {
                Location location = shuffledLocations.get(locationIndex);
                invRepo.save(new Inventory(item, location));
                locationIndex++;
            }
        }
    }
}
