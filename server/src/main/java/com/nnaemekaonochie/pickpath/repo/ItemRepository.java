package com.nnaemekaonochie.pickpath.repo;

import com.nnaemekaonochie.pickpath.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findBySku(String sku);
}