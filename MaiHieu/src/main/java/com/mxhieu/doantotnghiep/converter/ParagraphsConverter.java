package com.mxhieu.doantotnghiep.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class ParagraphsConverter implements AttributeConverter<List<String>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> paragraphs) {
        try {
            return objectMapper.writeValueAsString(paragraphs);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String data) {
        try {
            return objectMapper.readValue(data, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}

