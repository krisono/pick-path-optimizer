package com.nnaemekaonochie.pickpath.repo;

import com.nnaemekaonochie.pickpath.domain.Inventory;
import com.nnaemekaonochie.pickpath.domain.Item;
import com.nnaemekaonochie.pickpath.domain.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByItemIn(List<Item> items);

    List<Inventory> findByLocation(Location location);

    List<Inventory> findByItem(Item item);
}