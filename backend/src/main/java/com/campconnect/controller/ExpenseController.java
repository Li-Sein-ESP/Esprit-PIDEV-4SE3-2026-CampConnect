package com.campconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

<<<<<<< HEAD
import com.campconnect.dto.ExpenseDto;
=======
import com.campconnect.dto.ExpenseDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.dto.GroupBalances;
import com.campconnect.model.Expense;
import com.campconnect.service.IExpenseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final IExpenseService expenseService;

    @PostMapping
<<<<<<< HEAD
    public ResponseEntity<Expense> addExpense(@Valid @RequestBody ExpenseDto dto) {
=======
    public ResponseEntity<Expense> addExpense(@Valid @RequestBody ExpenseDTO dto) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        Expense expense = Expense.builder()
                .groupId(dto.getGroupId())
                .tripId(dto.getTripId())
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .paidByUserId(dto.getPaidByUserId())
                .splitType(dto.getSplitType())
                .participants(dto.getParticipants())
                .customShares(dto.getCustomShares())
                .linkedReservationId(dto.getLinkedReservationId())
                .build();
        Expense created = expenseService.addExpense(expense);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable("id") String id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getExpensesForGroup(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(expenseService.getExpensesForGroup(groupId));
    }

    @GetMapping("/group/{groupId}/balances")
    public ResponseEntity<GroupBalances> getBalances(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(expenseService.calculateBalances(groupId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable("id") String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
