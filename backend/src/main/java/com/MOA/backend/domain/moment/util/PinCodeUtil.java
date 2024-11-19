package com.MOA.backend.domain.moment.util;

import org.springframework.stereotype.Component;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Component
public class PinCodeUtil {

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private final SecureRandom random = new SecureRandom();

    public String generatePinCode() {
        return random.ints(6, 0, CHARS.length())
                .mapToObj(CHARS::charAt)
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }
}
