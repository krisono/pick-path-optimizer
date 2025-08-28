package com.nnaemekaonochie.pickpath.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Item item;
    @ManyToOne(optional = false)
    private Location location;

    public Inventory() {
    }

    public Inventory(Item item, Location location) {
        this.item = item;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public Item getItem() {
        return item;
    }

    public Location getLocation() {
        return location;
    }
}