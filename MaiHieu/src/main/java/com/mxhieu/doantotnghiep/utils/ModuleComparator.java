package com.mxhieu.doantotnghiep.utils;

import com.mxhieu.doantotnghiep.dto.response.ModuleResponse;
import com.mxhieu.doantotnghiep.entity.ModuleEntity;

import java.util.Comparator;

public class ModuleComparator implements Comparator<ModuleResponse> {
    @Override
    public int compare(ModuleResponse o1, ModuleResponse o2) {
        return Long.compare(o1.getOrderIndex(), o2.getOrderIndex());
    }
}
