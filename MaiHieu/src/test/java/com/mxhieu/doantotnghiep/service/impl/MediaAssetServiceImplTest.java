package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.service.MediaAssetService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MediaAssetServiceImplTest {

    @Test
    void mediaAssetServiceImpl_shouldBeInstantiable() {
        // Test Case ID: MAI-MAS-001
        MediaAssetService service = new MediaAssetServiceImpl();

        assertNotNull(service);
        assertTrue(service instanceof MediaAssetServiceImpl);
    }
}
