package com.example.moneytransfersystem.controller;

import com.example.moneytransfersystem.dto.ApiResponse;
import com.example.moneytransfersystem.dto.TransferRequest;
import com.example.moneytransfersystem.model.Account;
import com.example.moneytransfersystem.model.Reward;
import com.example.moneytransfersystem.model.TransactionLog;
import com.example.moneytransfersystem.repository.AccountRepository;
import com.example.moneytransfersystem.repository.RewardRepository;
import com.example.moneytransfersystem.repository.TransactionLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    private final AccountRepository accountRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final RewardRepository rewardRepository;

    public TransactionController(AccountRepository accountRepository,
                                 TransactionLogRepository transactionLogRepository,
                                 RewardRepository rewardRepository) {
        this.accountRepository = accountRepository;
        this.transactionLogRepository = transactionLogRepository;
        this.rewardRepository = rewardRepository;
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferRequest request) {
        Account sender = accountRepository.findById(request.getSenderId()).orElse(null);
        Account receiver = accountRepository.findById(request.getReceiverId()).orElse(null);

        if (sender == null || receiver == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid sender or receiver account"));
        }
        if (sender.getStatus() == Account.Status.LOCKED) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer is not possible because the sender account is locked"));
        }
        if (receiver.getStatus() == Account.Status.CLOSED) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer is not possible because the receiver account is closed"));
        }
        if (sender.getStatus() == Account.Status.CLOSED) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer is not possible because the sender account is closed"));
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Amount must be greater than zero"));
        }
        if (request.getAmount().compareTo(sender.getBalance()) > 0) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer exceeds sender balance"));
        }

        sender.setBalance(sender.getBalance().subtract(request.getAmount()));
        receiver.setBalance(receiver.getBalance().add(request.getAmount()));
        accountRepository.save(sender);
        accountRepository.save(receiver);

        int rewards = 0;
        if (request.getAmount().compareTo(BigDecimal.valueOf(99)) > 0) {
            rewards = request.getAmount().divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN).intValue();
        }

        TransactionLog log = new TransactionLog();
        log.setFromAccount(sender.getId());
        log.setToAccount(receiver.getId());
        log.setAmount(request.getAmount());
        log.setTransactionType("TRANSFER");
        log.setRewardsEarned(rewards);
        log.setCreatedAt(LocalDateTime.now());
        transactionLogRepository.save(log);

        Reward reward = rewardRepository.findByUsername(sender.getUsername()).orElse(null);
        if (reward == null) {
            reward = new Reward();
            reward.setUsername(sender.getUsername());
            reward.setRewardPoints(0);
            reward.setLastUpdated(LocalDateTime.now());
        }
        reward.setRewardPoints(reward.getRewardPoints() + rewards);
        reward.setLastUpdated(LocalDateTime.now());
        rewardRepository.save(reward);

        return ResponseEntity.ok(new ApiResponse(true, "Transfer completed successfully"));
    }

    @GetMapping("/{id}")
    public List<TransactionLog> getHistory(@PathVariable Long id) {
        return transactionLogRepository.findByFromAccountOrToAccount(id, id);
    }
}