package com.campconnect.user.dto;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String name;
    private List<String> tripIds = new ArrayList<>();
}
