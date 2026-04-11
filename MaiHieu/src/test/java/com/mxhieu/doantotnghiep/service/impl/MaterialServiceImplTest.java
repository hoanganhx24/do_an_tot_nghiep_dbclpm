package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.service.MaterialService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MaterialServiceImplTest {

    @Test
    void materialServiceImpl_shouldBeInstantiable() {
        // Test Case ID: MAI-MTS-001
        MaterialService service = new MaterialServiceImpl();

        assertNotNull(service);
        assertTrue(service instanceof MaterialServiceImpl);
    }
}
