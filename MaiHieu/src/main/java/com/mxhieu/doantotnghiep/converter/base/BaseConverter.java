package com.mxhieu.doantotnghiep.converter.base;

import com.mxhieu.doantotnghiep.dto.response.LessonResponse;
import com.mxhieu.doantotnghiep.entity.LessonEntity;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * BaseConverter hỗ trợ 3 kiểu:
 * E: Entity
 * REQ: Request DTO
 * RES: Response DTO
 */
public abstract class BaseConverter<E, REQ, RES> {

    @Autowired
    protected ModelMapper modelMapper;
    public <T> T toRequest(Map<String, Object> map, Class<T> dtoClass) {
        return modelMapper.map(map, dtoClass);
    }
    /**
     * Chuyển từ Request DTO sang Entity
     */
    public E toEntity(REQ request, Class<E> entityClass) {
        return modelMapper.map(request, entityClass);
    }

    /**
     * Chuyển từ Entity sang Response DTO
     */
    public RES toResponse(E entity, Class<RES> responseClass) {
        return modelMapper.map(entity, responseClass);
    }

    /**
     * Chuyển danh sách Entity sang danh sách Response DTO
     */
    public List<RES> toResponseList(List<E> entities, Class<RES> responseClass) {
        return entities.stream()
                .map(entity -> toResponse(entity, responseClass))
                .collect(Collectors.toList());
    }

}
