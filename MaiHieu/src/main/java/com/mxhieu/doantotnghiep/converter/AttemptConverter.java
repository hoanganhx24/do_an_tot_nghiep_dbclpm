package com.mxhieu.doantotnghiep.converter;

import com.mxhieu.doantotnghiep.converter.base.BaseConverter;
import com.mxhieu.doantotnghiep.dto.request.AttemptRequest;
import com.mxhieu.doantotnghiep.dto.response.AttemptResponse;
import com.mxhieu.doantotnghiep.entity.AttemptEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AttemptConverter extends BaseConverter<AttemptEntity, AttemptRequest, AttemptResponse> {
}
