package com.mxhieu.doantotnghiep.service;

import com.mxhieu.doantotnghiep.dto.request.AuthenticationRequest;
import com.mxhieu.doantotnghiep.dto.response.AuthenticationResponse;

public interface AuthenticationService {
    AuthenticationResponse logIn(AuthenticationRequest authenticationRequest);
    AuthenticationResponse refreshToken(String refreshToken);
}
