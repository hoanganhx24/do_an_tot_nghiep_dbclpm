package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.repository.custom.RoleRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleEntity,Integer>, RoleRepositoryCustom {
    Optional<RoleEntity> findByValue(String name);
}
