package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campconnect.dto.BalanceDetail;
import com.campconnect.dto.GroupBalances;

import com.campconnect.model.Expense;
import com.campconnect.model.ExpenseSplitType;
import com.campconnect.repository.ExpenseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements IExpenseService {

    private final ExpenseRepository expenseRepository;

    @Override
    public Expense addExpense(Expense expense) {
        expense.setCreatedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    @Override
    public Expense getExpenseById(String id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    @Override
    public List<Expense> getExpensesForGroup(String groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    @Override
    public GroupBalances calculateBalances(String groupId) {
        List<Expense> expenses = getExpensesForGroup(groupId);
        Map<String, Double> rawBalances = new HashMap<>();

        for (Expense expense : expenses) {
            String payer = expense.getPaidByUserId();
            double amount = expense.getAmount();

            // Payer gets credit
            rawBalances.put(payer, rawBalances.getOrDefault(payer, 0.0) + amount);

            if (expense.getSplitType() == ExpenseSplitType.EQUAL) {
                List<String> participants = expense.getParticipants();
                int count = participants.size();
                if (count > 0) {
                    double share = amount / (double) count;
                    for (String p : participants) {
                        rawBalances.put(p, rawBalances.getOrDefault(p, 0.0) - share);
                    }
                }
            } else if (expense.getSplitType() == ExpenseSplitType.CUSTOM) {
                for (Map.Entry<String, Double> entry : expense.getCustomShares().entrySet()) {
                    rawBalances.put(entry.getKey(), rawBalances.getOrDefault(entry.getKey(), 0.0) - entry.getValue());
                }
            }
        }

        // ONLY ROUND AT THE VERY END
        Map<String, Double> balances = new HashMap<>();
        rawBalances.forEach((user, val) -> {
            double rounded = round(val);
            if (Math.abs(rounded) > 0.009) {
                balances.put(user, rounded);
            }
        });

        List<BalanceDetail> details = new ArrayList<>();
        
        // Final settlement using Simplify Debts (Min Cash Flow)
        List<Map.Entry<String, Double>> debtors = balances.entrySet().stream()
                .filter(e -> e.getValue() < 0)
                .map(e -> new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()))
                .sorted(Map.Entry.comparingByValue())
                .collect(Collectors.toCollection(ArrayList::new));

        List<Map.Entry<String, Double>> creditors = balances.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(e -> new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()))
                .sorted(Map.Entry.comparingByValue(Collections.reverseOrder()))
                .collect(Collectors.toCollection(ArrayList::new));

        int dIdx = 0;
        int cIdx = 0;
        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            Map.Entry<String, Double> debtor = debtors.get(dIdx);
            Map.Entry<String, Double> creditor = creditors.get(cIdx);

            double debitVal = Math.abs(debtor.getValue());
            double creditVal = creditor.getValue();
            
            // Settle with rounding to avoid 0.009999...
            double settleAmount = round(Math.min(debitVal, creditVal));

            if (settleAmount > 0) {
                details.add(BalanceDetail.builder()
                        .fromUserId(debtor.getKey())
                        .toUserId(creditor.getKey())
                        .amount(settleAmount)
                        .build());

                debtor.setValue(round(debtor.getValue() + settleAmount));
                creditor.setValue(round(creditor.getValue() - settleAmount));
            }

            if (Math.abs(debtor.getValue()) < 0.009) dIdx++;
            if (Math.abs(creditor.getValue()) < 0.009) cIdx++;
        }

        return GroupBalances.builder()
                .groupId(groupId)
                .balances(balances)
                .details(details)
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }


    @Override
    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
