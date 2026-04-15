package com.campconnect.service;

import com.campconnect.dto.BalanceDetail;
import com.campconnect.dto.GroupBalances;
import com.campconnect.model.Expense;
import com.campconnect.model.ExpenseSplitType;
import com.campconnect.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private Expense sampleExpense;

    @BeforeEach
    void setUp() {
        sampleExpense = new Expense();
        sampleExpense.setId("exp-1");
        sampleExpense.setGroupId("group-1");
        sampleExpense.setAmount(60.0);
        sampleExpense.setPaidByUserId("user-A");
        sampleExpense.setSplitType(ExpenseSplitType.EQUAL);
        sampleExpense.setParticipants(Arrays.asList("user-A", "user-B", "user-C"));
    }

    @Test
    void addExpense_ShouldInitializeCorrectly() {
        // Arrange
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Expense result = expenseService.addExpense(sampleExpense);

        // Assert
        assertNotNull(result.getCreatedAt());
        verify(expenseRepository).save(sampleExpense);
    }

    @Test
    void calculateBalances_ShouldSplitEqually() {
        // Arrange: $60 split between A, B, C (20 each). A paid 60.
        // Balance A: +60 - 20 = +40
        // Balance B: -20
        // Balance C: -20
        when(expenseRepository.findByGroupId("group-1")).thenReturn(Arrays.asList(sampleExpense));

        // Act
        GroupBalances balances = expenseService.calculateBalances("group-1");

        // Assert
        assertEquals(40.0, balances.getBalances().get("user-A"));
        assertEquals(-20.0, balances.getBalances().get("user-B"));
        assertEquals(-20.0, balances.getBalances().get("user-C"));
        
        // Check transaction details
        assertEquals(2, balances.getDetails().size()); // B -> A, C -> A
        assertTrue(balances.getDetails().stream()
                .anyMatch(d -> d.getFromUserId().equals("user-B") && d.getToUserId().equals("user-A") && d.getAmount() == 20.0));
    }

    @Test
    void calculateBalances_ShouldHandleCustomSplits() {
        // Arrange: $100 paid by A. Custom: B owes 70, A owes 30.
        Expense customExp = new Expense();
        customExp.setPaidByUserId("user-A");
        customExp.setAmount(100.0);
        customExp.setSplitType(ExpenseSplitType.CUSTOM);
        Map<String, Double> customShares = new HashMap<>();
        customShares.put("user-A", 30.0);
        customShares.put("user-B", 70.0);
        customExp.setCustomShares(customShares);

        when(expenseRepository.findByGroupId("group-1")).thenReturn(Arrays.asList(customExp));

        // Act
        GroupBalances balances = expenseService.calculateBalances("group-1");

        // Assert
        assertEquals(70.0, balances.getBalances().get("user-A")); // +100 - 30
        assertEquals(-70.0, balances.getBalances().get("user-B"));
    }

    @Test
    void calculateBalances_ShouldHandleMultipleExpenses() {
        // 1. A paid 60 for A, B, C (Eq) -> A:+40, B:-20, C:-20
        // 2. B paid 30 for A, B, C (Eq) -> B:+20, A:-10, C:-10
        // Total: A: +30, B: +0, C: -30
        Expense exp2 = new Expense();
        exp2.setPaidByUserId("user-B");
        exp2.setAmount(30.0);
        exp2.setSplitType(ExpenseSplitType.EQUAL);
        exp2.setParticipants(Arrays.asList("user-A", "user-B", "user-C"));

        when(expenseRepository.findByGroupId("group-1")).thenReturn(Arrays.asList(sampleExpense, exp2));

        // Act
        GroupBalances balances = expenseService.calculateBalances("group-1");

        // Assert
        assertEquals(30.0, balances.getBalances().get("user-A"));
        assertEquals(0.0, balances.getBalances().get("user-B"));
        assertEquals(-30.0, balances.getBalances().get("user-C"));
        
        assertEquals(1, balances.getDetails().size()); // C -> A
        BalanceDetail detail = balances.getDetails().get(0);
        assertEquals("user-C", detail.getFromUserId());
        assertEquals("user-A", detail.getToUserId());
        assertEquals(30.0, detail.getAmount());
    }
}
