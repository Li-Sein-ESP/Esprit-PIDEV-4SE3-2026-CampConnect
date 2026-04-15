package com.campconnect.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    private String id;

    private String groupId;

    private String tripId;

    private Double amount;

    private ExpenseCategory category;

    private String paidByUserId;

    private ExpenseSplitType splitType;

    @Builder.Default
    private List<String> participants = new ArrayList<>(); // Used if EQUAL

    @Builder.Default
    private Map<String, Double> customShares = new HashMap<>(); // Used if CUSTOM

    private String linkedReservationId;

    @CreatedDate
    private LocalDateTime createdAt;
}
