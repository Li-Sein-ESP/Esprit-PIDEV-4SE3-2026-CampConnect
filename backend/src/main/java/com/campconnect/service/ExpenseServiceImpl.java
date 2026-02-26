package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

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

        return GroupBalances.builder()
                .groupId(groupId)
                .balances(balances)
                .build();
    }

    @Override
    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
