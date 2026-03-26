package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.TrackEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrackRepository extends JpaRepository<TrackEntity,Integer> {
    Optional<TrackEntity> findByCode(String code);
}
