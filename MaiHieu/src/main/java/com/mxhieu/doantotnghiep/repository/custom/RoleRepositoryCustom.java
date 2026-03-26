package com.mxhieu.doantotnghiep.repository.custom;

import com.mxhieu.doantotnghiep.entity.RoleEntity;

import java.util.List;
import java.util.Optional;

public interface RoleRepositoryCustom {
    Optional<List<RoleEntity>> findByEmail(String email);
}
