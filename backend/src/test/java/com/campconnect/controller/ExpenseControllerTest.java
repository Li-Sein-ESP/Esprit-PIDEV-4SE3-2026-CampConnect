package com.campconnect.controller;

import com.campconnect.dto.ExpenseDTO;
import com.campconnect.dto.GroupBalances;
import com.campconnect.model.Expense;
import com.campconnect.service.IExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IExpenseService expenseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addExpense_ShouldReturnCreated() throws Exception {
        // Arrange
        ExpenseDTO dto = new ExpenseDTO();
        dto.setAmount(100.0);
        dto.setGroupId("group-1");

        Expense created = Expense.builder().id("exp-1").amount(100.0).build();
        when(expenseService.addExpense(any(Expense.class))).thenReturn(created);

        // Act & Assert
        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("exp-1"));
    }

    @Test
    void getBalances_ShouldReturnBalances() throws Exception {
        // Arrange
        GroupBalances balances = GroupBalances.builder().groupId("group-1").build();
        when(expenseService.calculateBalances("group-1")).thenReturn(balances);

        // Act & Assert
        mockMvc.perform(get("/api/expenses/group/group-1/balances"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupId").value("group-1"));
    }

    @Test
    void getExpensesForGroup_ShouldReturnList() throws Exception {
        // Arrange
        Expense exp = Expense.builder().id("exp-1").build();
        when(expenseService.getExpensesForGroup("group-1")).thenReturn(Collections.singletonList(exp));

        // Act & Assert
        mockMvc.perform(get("/api/expenses/group/group-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("exp-1"));
    }
}
