package com.mxhieu.doantotnghiep.repository.custom.impl;


import com.mxhieu.doantotnghiep.entity.RoleEntity;
import com.mxhieu.doantotnghiep.repository.custom.RoleRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RoleRepositoryImpl implements RoleRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;
    @Override
    public Optional<List<RoleEntity>> findByEmail(String email) {
        StringBuilder sql = new StringBuilder("SELECT r.* FROM role r ");
        sql.append(" JOIN userrole ur ON r.id = ur.roleid ");
        sql.append(" JOIN user u ON ur.userid = u.id ");
        sql.append(" WHERE u.email = :email ");

        List<RoleEntity> roles = entityManager.createNativeQuery(sql.toString(), RoleEntity.class)
                .setParameter("email", email)
                .getResultList();
        return Optional.ofNullable(roles);

    }
}
