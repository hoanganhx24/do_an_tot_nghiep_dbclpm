package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.ChoiceEntity;
import com.mxhieu.doantotnghiep.repository.custom.ChoiceRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChoiceRepository extends JpaRepository<ChoiceEntity, Integer>, ChoiceRepositoryCustom {

}
