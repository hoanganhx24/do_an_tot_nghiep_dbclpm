package com.mxhieu.doantotnghiep.repository;

import com.mxhieu.doantotnghiep.entity.DictionaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DictionaryRepository extends JpaRepository<DictionaryEntity, Integer> {
    Optional<DictionaryEntity> findByWord(String word);

    List<DictionaryEntity> findTop10ByWordContainingIgnoreCase(String word);
}
