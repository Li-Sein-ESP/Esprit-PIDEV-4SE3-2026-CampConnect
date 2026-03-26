package com.campconnect.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupBalances {
    private String groupId;
    private Map<String, Double> balances; // userId -> net amount
    private List<BalanceDetail> details; // simplified debts
}
