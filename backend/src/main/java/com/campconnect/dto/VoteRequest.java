package com.campconnect.dto;

import lombok.Data;

@Data
public class VoteRequest {
    private String userId;
    private String option;
}
