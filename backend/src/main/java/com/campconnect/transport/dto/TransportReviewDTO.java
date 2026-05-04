package com.campconnect.transport.dto;

import lombok.Data;

@Data
public class TransportReviewDTO {
    private String userId;
    private int rating;
    private String comment;
}
