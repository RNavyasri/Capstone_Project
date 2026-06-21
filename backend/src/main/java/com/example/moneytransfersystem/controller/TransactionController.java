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
        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;

        if (sender == null || receiver == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid sender or receiver account"));
        }

        if (sender.getStatus() == Account.Status.LOCKED || sender.getStatus() == Account.Status.CLOSED) {
            saveTransactionLog(sender, receiver, amount, "DEBIT", 0, "failure");
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer is not possible because the sender account is not active"));
        }
        if (receiver.getStatus() == Account.Status.LOCKED || receiver.getStatus() == Account.Status.CLOSED) {
            saveTransactionLog(sender, receiver, amount, "DEBIT", 0, "failure");
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer is not possible because the receiver account is not active"));
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            saveTransactionLog(sender, receiver, amount, "DEBIT", 0, "failure");
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Amount must be greater than zero"));
        }
        if (amount.compareTo(sender.getBalance()) > 0) {
            saveTransactionLog(sender, receiver, amount, "DEBIT", 0, "failure");
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Transfer exceeds sender balance"));
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));
        accountRepository.save(sender);
        accountRepository.save(receiver);

        int rewards = 0;
        if (amount.compareTo(BigDecimal.valueOf(99)) > 0) {
            rewards = amount.divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN).intValue();
        }

        saveTransactionLog(sender, receiver, amount, "DEBIT", rewards, "success");

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

    private void saveTransactionLog(Account sender, Account receiver, BigDecimal amount, String transactionType,
                                    int rewardsEarned, String status) {
        TransactionLog log = new TransactionLog();
        log.setFromAccount(sender.getId());
        log.setToAccount(receiver.getId());
        log.setAmount(amount);
        log.setTransactionType(transactionType);
        log.setStatus((status == null || status.isBlank()) ? "failure" : status.trim().toLowerCase());
        log.setRewardsEarned(rewardsEarned);
        log.setCreatedAt(LocalDateTime.now());
        transactionLogRepository.saveAndFlush(log);
    }

    @GetMapping("/{id}")
    public List<TransactionLog> getHistory(@PathVariable Long id) {
        return transactionLogRepository.findByFromAccountOrToAccount(id, id)
                .stream()
                .map(log -> {
                    if (log.getFromAccount() != null && log.getFromAccount().equals(id)) {
                        log.setTransactionType("DEBIT");
                    } else if (log.getToAccount() != null && log.getToAccount().equals(id)) {
                        log.setTransactionType("CREDIT");
                    }
                    return log;
                })
                .toList();
    }
}