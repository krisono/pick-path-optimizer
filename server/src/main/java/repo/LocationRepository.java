package com.nnaemekaonochie.pickpath.repo;

import com.nnaemekaonochie.pickpath.domain.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByLocationCode(String code);
}