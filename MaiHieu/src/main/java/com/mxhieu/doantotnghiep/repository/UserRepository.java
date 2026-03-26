package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.UserEntity;
import com.mxhieu.doantotnghiep.repository.custom.UserRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity,Integer>, UserRepositoryCustom {
    boolean existsByEmail(String email);
    Optional<UserEntity> findByEmail(String email);
}
