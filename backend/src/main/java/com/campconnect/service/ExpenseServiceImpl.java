package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
        Map<String, Double> balances = new HashMap<>();

        for (Expense expense : expenses) {
            String payer = expense.getPaidByUserId();
            Double amount = expense.getAmount();

            // Payer gets credit
            balances.put(payer, balances.getOrDefault(payer, 0.0) + amount);

            if (expense.getSplitType() == ExpenseSplitType.EQUAL) {
                int count = expense.getParticipants().size();
                if (count > 0) {
                    Double share = amount / count;
                    for (String participant : expense.getParticipants()) {
                        balances.put(participant, balances.getOrDefault(participant, 0.0) - share);
                    }
                }
            } else if (expense.getSplitType() == ExpenseSplitType.CUSTOM) {
                for (Map.Entry<String, Double> entry : expense.getCustomShares().entrySet()) {
                    String user = entry.getKey();
                    Double share = entry.getValue();
                    balances.put(user, balances.getOrDefault(user, 0.0) - share);
                }
            }
        }

        List<BalanceDetail> details = new ArrayList<>();
        
        // Final balances might have floating point noise, use small epsilon
        final double EPSILON = 0.01;
        
        Map<String, Double> mutableBalances = new HashMap<>(balances);
        
        List<Map.Entry<String, Double>> debtors = mutableBalances.entrySet().stream()
                .filter(e -> e.getValue() < -EPSILON)
                .collect(Collectors.toList());

        List<Map.Entry<String, Double>> creditors = mutableBalances.entrySet().stream()
                .filter(e -> e.getValue() > EPSILON)
                .collect(Collectors.toList());

        int dIdx = 0;
        int cIdx = 0;
        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            Map.Entry<String, Double> debtor = debtors.get(dIdx);
            Map.Entry<String, Double> creditor = creditors.get(cIdx);

            double debitVal = Math.abs(debtor.getValue());
            double creditVal = creditor.getValue();

            double settleAmount = Math.min(debitVal, creditVal);
            
            details.add(BalanceDetail.builder()
                    .fromUserId(debtor.getKey())
                    .toUserId(creditor.getKey())
                    .amount(settleAmount)
                    .build());

            debtor.setValue(debtor.getValue() + settleAmount);
            creditor.setValue(creditor.getValue() - settleAmount);

            if (Math.abs(debtor.getValue()) < EPSILON) dIdx++;
            if (Math.abs(creditor.getValue()) < EPSILON) cIdx++;
        }

        return GroupBalances.builder()
                .groupId(groupId)
                .balances(balances) // Return original net balances or results
                .details(details)
                .build();
    }


    @Override
    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
