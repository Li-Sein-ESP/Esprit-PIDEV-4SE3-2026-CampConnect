package com.campconnect.service;

import java.util.List;

import com.campconnect.dto.GroupBalances;
import com.campconnect.model.Expense;

public interface IExpenseService {
    Expense addExpense(Expense expense);

    Expense getExpenseById(String id);

    List<Expense> getExpensesForGroup(String groupId);

    GroupBalances calculateBalances(String groupId);

    void deleteExpense(String id);
}
