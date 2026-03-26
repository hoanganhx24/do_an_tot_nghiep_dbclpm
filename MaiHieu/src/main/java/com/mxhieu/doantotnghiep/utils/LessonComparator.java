package com.mxhieu.doantotnghiep.utils;

import com.mxhieu.doantotnghiep.dto.response.LessonResponse;

import java.util.Comparator;

public class LessonComparator implements Comparator<LessonResponse> {
    @Override
    public int compare(LessonResponse l1, LessonResponse l2) {
        return Integer.compare(l1.getOrderIndex(), l2.getOrderIndex());
    }
}
