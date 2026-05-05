package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.DeliveryRequest;
import com.campconnect.delivery.dto.DeliveryResponse;
import com.campconnect.delivery.dto.DriverProfileStatsResponse;
import com.campconnect.delivery.dto.EarningsResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryPriority;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.modelmapper.ModelMapper;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DeliveryServiceTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private DeliveryService deliveryService;

    @BeforeEach
    void setUp() {
        when(modelMapper.map(any(DeliveryRequest.class), any())).thenAnswer(invocation -> {
            DeliveryRequest req = invocation.getArgument(0);
            Delivery d = new Delivery();
            ReflectionTestUtils.setField(d, "rentalId", ReflectionTestUtils.getField(req, "rentalId"));
            ReflectionTestUtils.setField(d, "purchaseId", ReflectionTestUtils.getField(req, "purchaseId"));
            ReflectionTestUtils.setField(d, "driverId", ReflectionTestUtils.getField(req, "driverId"));
            ReflectionTestUtils.setField(d, "pickupAddress", ReflectionTestUtils.getField(req, "pickupAddress"));
            ReflectionTestUtils.setField(d, "deliveryAddress", ReflectionTestUtils.getField(req, "deliveryAddress"));
            ReflectionTestUtils.setField(d, "scheduledDate", ReflectionTestUtils.getField(req, "scheduledDate"));
            ReflectionTestUtils.setField(d, "priority", ReflectionTestUtils.getField(req, "priority"));
            return d;
        });
        when(modelMapper.map(any(Delivery.class), any())).thenAnswer(invocation -> {
            Delivery d = invocation.getArgument(0);
            DeliveryResponse r = new DeliveryResponse();
            ReflectionTestUtils.setField(r, "id", ReflectionTestUtils.getField(d, "id"));
            ReflectionTestUtils.setField(r, "rentalId", ReflectionTestUtils.getField(d, "rentalId"));
            ReflectionTestUtils.setField(r, "status", ReflectionTestUtils.getField(d, "status"));
            ReflectionTestUtils.setField(r, "driverName", ReflectionTestUtils.getField(d, "driverName"));
            ReflectionTestUtils.setField(r, "deliveredDate", ReflectionTestUtils.getField(d, "deliveredDate"));
            return r;
        });
    }

    @Test
    void create_ShouldThrow_WhenNoRentalOrPurchaseProvided() {
        DeliveryRequest request = new DeliveryRequest();
        ReflectionTestUtils.setField(request, "driverId", "mock-driver-1");
        ReflectionTestUtils.setField(request, "pickupAddress", "A");
        ReflectionTestUtils.setField(request, "deliveryAddress", "B");
        ReflectionTestUtils.setField(request, "priority", DeliveryPriority.NORMAL);
        ReflectionTestUtils.setField(request, "scheduledDate", LocalDate.now().plusDays(1));

        assertThrows(BadRequestException.class, () -> deliveryService.create(request));
    }

    @Test
    void create_ShouldCreateDelivery_WhenValidRentalAndMockDriver() {
        Rental rental = new Rental();
        ReflectionTestUtils.setField(rental, "id", "rental-1");
        ReflectionTestUtils.setField(rental, "status", RentalStatus.PENDING);
        ReflectionTestUtils.setField(rental, "startDate", LocalDate.now());
        ReflectionTestUtils.setField(rental, "endDate", LocalDate.now().plusDays(5));

        DeliveryRequest request = new DeliveryRequest();
        ReflectionTestUtils.setField(request, "rentalId", "rental-1");
        ReflectionTestUtils.setField(request, "driverId", "mock-driver-1");
        ReflectionTestUtils.setField(request, "pickupAddress", "Camp Base");
        ReflectionTestUtils.setField(request, "deliveryAddress", "Forest Trail");
        ReflectionTestUtils.setField(request, "scheduledDate", LocalDate.now().plusDays(2));
        ReflectionTestUtils.setField(request, "priority", DeliveryPriority.HIGH);

        when(rentalRepository.findById("rental-1")).thenReturn(Optional.of(rental));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> {
            Delivery d = invocation.getArgument(0);
            ReflectionTestUtils.setField(d, "id", "delivery-1");
            return d;
        });

        DeliveryResponse response = deliveryService.create(request);

        assertEquals("delivery-1", ReflectionTestUtils.getField(response, "id"));
        assertEquals(DeliveryStatus.CREATED, ReflectionTestUtils.getField(response, "status"));
        assertEquals("System Dispatch", ReflectionTestUtils.getField(response, "driverName"));
        assertEquals("rental-1", ReflectionTestUtils.getField(response, "rentalId"));
    }

    @Test
    void create_ShouldThrowConflict_WhenDuplicateActiveDeliveryExists() {
        Rental rental = new Rental();
        ReflectionTestUtils.setField(rental, "id", "rental-1");
        ReflectionTestUtils.setField(rental, "status", RentalStatus.PENDING);
        ReflectionTestUtils.setField(rental, "startDate", LocalDate.now());
        ReflectionTestUtils.setField(rental, "endDate", LocalDate.now().plusDays(5));

        DeliveryRequest request = new DeliveryRequest();
        ReflectionTestUtils.setField(request, "rentalId", "rental-1");
        ReflectionTestUtils.setField(request, "driverId", "mock-driver-1");
        ReflectionTestUtils.setField(request, "pickupAddress", "Camp Base");
        ReflectionTestUtils.setField(request, "deliveryAddress", "Forest Trail");
        ReflectionTestUtils.setField(request, "scheduledDate", LocalDate.now().plusDays(2));
        ReflectionTestUtils.setField(request, "priority", DeliveryPriority.NORMAL);

        when(rentalRepository.findById("rental-1")).thenReturn(Optional.of(rental));
        when(deliveryRepository.existsByRentalIdAndStatusAndDeletedFalse("rental-1", DeliveryStatus.CREATED))
                .thenReturn(true);

        assertThrows(ConflictException.class, () -> deliveryService.create(request));
    }

    @Test
    void create_ShouldThrowBadRequest_WhenAssignedUserIsNotDriver() {
        Rental rental = new Rental();
        ReflectionTestUtils.setField(rental, "id", "rental-1");
        ReflectionTestUtils.setField(rental, "status", RentalStatus.PENDING);
        ReflectionTestUtils.setField(rental, "startDate", LocalDate.now());
        ReflectionTestUtils.setField(rental, "endDate", LocalDate.now().plusDays(5));

        User user = new User("user1", "user1@test.com", "pass", "User 1");
        ReflectionTestUtils.setField(user, "id", "user-1");

        DeliveryRequest request = new DeliveryRequest();
        ReflectionTestUtils.setField(request, "rentalId", "rental-1");
        ReflectionTestUtils.setField(request, "driverId", "user-1");
        ReflectionTestUtils.setField(request, "pickupAddress", "Camp Base");
        ReflectionTestUtils.setField(request, "deliveryAddress", "Forest Trail");
        ReflectionTestUtils.setField(request, "scheduledDate", LocalDate.now().plusDays(2));
        ReflectionTestUtils.setField(request, "priority", DeliveryPriority.NORMAL);

        when(rentalRepository.findById("rental-1")).thenReturn(Optional.of(rental));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> deliveryService.create(request));
    }

    @Test
    void updateStatus_ShouldUpdate_WhenTransitionIsValid() {
        Delivery delivery = new Delivery();
        ReflectionTestUtils.setField(delivery, "id", "delivery-1");
        ReflectionTestUtils.setField(delivery, "status", DeliveryStatus.CREATED);
        ReflectionTestUtils.setField(delivery, "deleted", false);

        when(deliveryRepository.findById("delivery-1")).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryResponse response = deliveryService.updateStatus("delivery-1", DeliveryStatus.PENDING);

        assertEquals(DeliveryStatus.PENDING, ReflectionTestUtils.getField(response, "status"));
    }

    @Test
    void updateStatus_ShouldThrowConflict_WhenTransitionIsInvalid() {
        Delivery delivery = new Delivery();
        ReflectionTestUtils.setField(delivery, "id", "delivery-1");
        ReflectionTestUtils.setField(delivery, "status", DeliveryStatus.CREATED);
        ReflectionTestUtils.setField(delivery, "deleted", false);

        when(deliveryRepository.findById("delivery-1")).thenReturn(Optional.of(delivery));

        assertThrows(ConflictException.class,
                () -> deliveryService.updateStatus("delivery-1", DeliveryStatus.DELIVERED));
    }

    @Test
    void updateStatus_ShouldCompleteRental_WhenMarkedDelivered() {
        Delivery delivery = new Delivery();
        ReflectionTestUtils.setField(delivery, "id", "delivery-1");
        ReflectionTestUtils.setField(delivery, "rentalId", "rental-1");
        ReflectionTestUtils.setField(delivery, "status", DeliveryStatus.IN_TRANSIT);
        ReflectionTestUtils.setField(delivery, "deleted", false);

        Rental rental = new Rental();
        ReflectionTestUtils.setField(rental, "id", "rental-1");
        ReflectionTestUtils.setField(rental, "status", RentalStatus.ACTIVE);

        when(deliveryRepository.findById("delivery-1")).thenReturn(Optional.of(delivery));
        when(rentalRepository.findById("rental-1")).thenReturn(Optional.of(rental));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryResponse response = deliveryService.updateStatus("delivery-1", DeliveryStatus.DELIVERED);

        assertEquals(DeliveryStatus.DELIVERED, ReflectionTestUtils.getField(response, "status"));
        assertNotNull(ReflectionTestUtils.getField(response, "deliveredDate"));
        assertEquals(RentalStatus.COMPLETED, ReflectionTestUtils.getField(rental, "status"));
        verify(rentalRepository, times(1)).save(rental);
    }

    @Test
    void softDelete_ShouldThrowConflict_WhenDeliveryIsActive() {
        Delivery delivery = new Delivery();
        ReflectionTestUtils.setField(delivery, "id", "delivery-1");
        ReflectionTestUtils.setField(delivery, "status", DeliveryStatus.ASSIGNED);
        ReflectionTestUtils.setField(delivery, "deleted", false);

        when(deliveryRepository.findById("delivery-1")).thenReturn(Optional.of(delivery));

        assertThrows(ConflictException.class, () -> deliveryService.softDelete("delivery-1"));
        verify(deliveryRepository, never()).save(any(Delivery.class));
    }

    @Test
    void findById_ShouldThrow_WhenDeliveryNotFound() {
        when(deliveryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliveryService.findById("missing"));
    }

    @Test
    void calculateEarnings_ShouldCalculateTotalsAndBreakdown() {
        Delivery recent = new Delivery();
        ReflectionTestUtils.setField(recent, "id", "d-1");
        ReflectionTestUtils.setField(recent, "deliveredDate", LocalDateTime.now().minusDays(1));

        Delivery older = new Delivery();
        ReflectionTestUtils.setField(older, "id", "d-2");
        ReflectionTestUtils.setField(older, "deliveredDate", LocalDateTime.now().minusDays(40));

        when(deliveryRepository.findByDriverIdAndStatusAndDeletedFalse("driver-1", DeliveryStatus.DELIVERED))
                .thenReturn(List.of(recent, older));

        EarningsResponse response = deliveryService.calculateEarnings("driver-1");

        assertEquals(2L, ReflectionTestUtils.getField(response, "deliveriesCompleted"));
        assertEquals(new BigDecimal("30.00"), ReflectionTestUtils.getField(response, "totalEarnings"));
        assertEquals(new BigDecimal("15.00"), ReflectionTestUtils.getField(response, "averagePerDelivery"));
        assertEquals(new BigDecimal("15.00"), ReflectionTestUtils.getField(response, "weeklyEarnings"));
        assertNotNull(ReflectionTestUtils.getField(response, "dailyBreakdown"));
    }

    @Test
    void getDriverProfileStats_ShouldReturnComputedStats() {
        when(deliveryRepository.countByDriverIdAndDeletedFalse("driver-1")).thenReturn(10L);
        when(deliveryRepository.countByDriverIdAndStatusInAndDeletedFalse(any(), any())).thenReturn(3L);
        when(deliveryRepository.countByDriverIdAndStatusAndDeletedFalse("driver-1", DeliveryStatus.DELIVERED))
                .thenReturn(5L);
        when(deliveryRepository.countByDriverIdAndStatusAndDeletedFalse("driver-1", DeliveryStatus.CANCELLED))
                .thenReturn(2L);
        when(deliveryRepository.countByDriverIdAndStatusAndDeletedFalse("driver-1", DeliveryStatus.FAILED))
                .thenReturn(1L);

        DriverProfileStatsResponse response = deliveryService.getDriverProfileStats("driver-1");

        assertEquals(10L, ReflectionTestUtils.getField(response, "totalDeliveries"));
        assertEquals(3L, ReflectionTestUtils.getField(response, "activeJobs"));
        assertEquals(5L, ReflectionTestUtils.getField(response, "deliveredCount"));
        assertEquals(new BigDecimal("75.00"), ReflectionTestUtils.getField(response, "totalEarnings"));
        assertEquals(62.5, (Double) ReflectionTestUtils.getField(response, "completionRate"));
    }
}
