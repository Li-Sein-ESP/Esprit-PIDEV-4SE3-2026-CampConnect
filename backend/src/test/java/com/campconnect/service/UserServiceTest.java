package com.campconnect.service;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.dto.UserStatsResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.model.User;
import com.campconnect.repository.ReservationRepository;
import com.campconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("camper1", "camper@test.com", "encoded", "Camper One");
        ReflectionTestUtils.setField(user, "id", "user-1");
    }

    @Test
    void getProfile_ShouldReturnUserProfile_WhenUserExists() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile("user-1");

        assertEquals("user-1", ReflectionTestUtils.getField(response, "id"));
        assertEquals("camper1", ReflectionTestUtils.getField(response, "username"));
    }

    @Test
    void getProfile_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getProfile("missing"));
    }

    @Test
    void updateProfile_ShouldUpdateNameAndProfileDetails() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "name", "Updated Name");
        ReflectionTestUtils.setField(request, "profileDetails", Map.of("city", "Algiers"));

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.updateProfile("user-1", request);

        assertEquals("Updated Name", ReflectionTestUtils.getField(response, "name"));
        Object details = ReflectionTestUtils.getField(response, "profileDetails");
        assertTrue(details instanceof Map);
        assertEquals("Algiers", ((Map<?, ?>) details).get("city"));
    }

    @Test
    void updateProfile_ShouldThrow_WhenEmailAlreadyInUse() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "email", "taken@test.com");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.updateProfile("user-1", request));
    }

    @Test
    void changePassword_ShouldUpdatePassword_WhenCurrentPasswordMatches() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        ReflectionTestUtils.setField(request, "currentPassword", "old-pass");
        ReflectionTestUtils.setField(request, "newPassword", "new-pass");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-pass", "encoded")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("new-encoded");

        userService.changePassword("user-1", request);

        verify(userRepository, times(1)).save(user);
        assertEquals("new-encoded", ReflectionTestUtils.getField(user, "password"));
    }

    @Test
    void changePassword_ShouldThrow_WhenCurrentPasswordIncorrect() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        ReflectionTestUtils.setField(request, "currentPassword", "wrong-pass");
        ReflectionTestUtils.setField(request, "newPassword", "new-pass");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pass", "encoded")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.changePassword("user-1", request));
    }

    @Test
    void getUserStats_ShouldReturnAggregatedStats() {
        Rental activeRental = new Rental();
        ReflectionTestUtils.setField(activeRental, "renterId", "user-1");
        ReflectionTestUtils.setField(activeRental, "status", RentalStatus.ACTIVE);

        Rental completedRental = new Rental();
        ReflectionTestUtils.setField(completedRental, "renterId", "user-1");
        ReflectionTestUtils.setField(completedRental, "status", RentalStatus.COMPLETED);

        Purchase p1 = new Purchase();
        ReflectionTestUtils.setField(p1, "buyerId", "user-1");
        Purchase p2 = new Purchase();
        ReflectionTestUtils.setField(p2, "buyerId", "user-2");

        when(reservationRepository.countByUserIdAndStatus("user-1", com.campconnect.model.ReservationStatus.COMPLETED))
                .thenReturn(4L);
        when(reservationRepository.countByUserIdAndStatus("user-1", com.campconnect.model.ReservationStatus.CONFIRMED))
                .thenReturn(2L);
        when(rentalRepository.findAll()).thenReturn(List.of(activeRental, completedRental));
        when(purchaseRepository.findAll()).thenReturn(List.of(p1, p2));

        UserStatsResponse response = userService.getUserStats("user-1");

        assertEquals(4L, ReflectionTestUtils.getField(response, "campsitesVisited"));
        assertEquals(2L, ReflectionTestUtils.getField(response, "activeReservations"));
        assertEquals(2L, ReflectionTestUtils.getField(response, "gearRented"));
        assertEquals(1L, ReflectionTestUtils.getField(response, "activeRentals"));
        assertEquals(1L, ReflectionTestUtils.getField(response, "gearPurchased"));
    }
}
