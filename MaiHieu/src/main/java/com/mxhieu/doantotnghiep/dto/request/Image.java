package com.mxhieu.doantotnghiep.dto.request;

import jakarta.persistence.PrePersist;

import java.time.LocalDateTime;


public class Image {
    private String name;
    private String type;
    private byte[] data;
}
