package com.mxhieu.doantotnghiep.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

@Converter
public class IntegerListConverter
        implements AttributeConverter<List<Integer>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Integer> attribute) {
        try {
            return attribute == null
                    ? null
                    : objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Integer> convertToEntityAttribute(String dbData) {
        try {
            return dbData == null
                    ? new ArrayList<>()
                    : objectMapper.readValue(
                    dbData,
                    new TypeReference<List<Integer>>() {}
            );
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
