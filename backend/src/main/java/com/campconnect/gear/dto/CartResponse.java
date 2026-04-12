package com.campconnect.gear.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private String id;
    private String userId;

    private List<CartItemResponse> items;

    private BigDecimal subtotal;
    private BigDecimal totalDeposit;
    private BigDecimal grandTotal;
}
