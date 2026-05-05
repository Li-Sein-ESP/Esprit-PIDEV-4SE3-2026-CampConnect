package com.campconnect.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.campconnect.model.ExpenseCategory;
import com.campconnect.model.ExpenseSplitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDto {
    private String id;
    private String groupId;
    private String tripId;
    private Double amount;
    private ExpenseCategory category;
    private String paidByUserId;
    private ExpenseSplitType splitType;
    private List<String> participants;
    private Map<String, Double> customShares;
    private String linkedReservationId;
    private LocalDateTime createdAt;
}
