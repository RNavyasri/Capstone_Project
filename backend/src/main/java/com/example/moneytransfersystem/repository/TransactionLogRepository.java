package com.example.moneytransfersystem.repository;

import com.example.moneytransfersystem.model.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog, Long> {
    List<TransactionLog> findByFromAccountOrToAccount(Long fromAccount, Long toAccount);
}