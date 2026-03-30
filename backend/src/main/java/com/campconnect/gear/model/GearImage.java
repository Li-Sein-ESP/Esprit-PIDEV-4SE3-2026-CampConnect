package com.campconnect.gear.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GearImage {

    @Id
    private String id;
    private String imageUrl;

    public GearImage(String imageUrl) {
        this.id = UUID.randomUUID().toString();
        this.imageUrl = imageUrl;
    }
}
