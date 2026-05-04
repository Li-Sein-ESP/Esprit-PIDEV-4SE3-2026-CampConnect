package com.campconnect.dto;

<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
=======
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String name;
<<<<<<< HEAD
    private String description;
    private String notes;
    private String destination;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String difficulty;
    private String groupId;
    private String creatorId;
    private String status;
    private LocalDateTime createdAt;
=======
    private String notes;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotBlank(message = "Category is required")
    private String categoryName;
    
    private String difficulty;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String creatorId;
    private String groupId;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
