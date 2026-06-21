package com.example.moneytransfersystem.controller;

import com.example.moneytransfersystem.dto.ApiResponse;
import com.example.moneytransfersystem.dto.LoginRequest;
import com.example.moneytransfersystem.model.Account;
import com.example.moneytransfersystem.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String password = request.getPassword() == null ? "" : request.getPassword();

        if (username.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Please enter both username and password"));
        }

        Account account = accountRepository.findByUsername(username).orElse(null);
        if (account == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Username not found"));
        }
        if (!isPasswordValid(password, account.getPassword())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Incorrect password"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "account", account
        ));
    }

    private boolean isPasswordValid(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (passwordEncoder.matches(rawPassword, storedPassword)) {
            return true;
        }
        return rawPassword.equals(storedPassword);
    }
}