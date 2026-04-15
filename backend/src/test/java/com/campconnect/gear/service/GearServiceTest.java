package com.campconnect.gear.service;

import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.GearRequest;
import com.campconnect.gear.dto.GearResponse;
import com.campconnect.gear.dto.ProviderStatsResponse;
import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.model.ListingType;
import com.campconnect.gear.model.MaintenanceRecord;
import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.MaintenanceRecordRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GearServiceTest {

    @Mock
    private GearRepository gearRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private GearService gearService;

    @BeforeEach
    void setUp() {
        doAnswer(invocation -> {
            GearRequest req = invocation.getArgument(0);
            Gear gear = invocation.getArgument(1);
            ReflectionTestUtils.setField(gear, "name", ReflectionTestUtils.getField(req, "name"));
            ReflectionTestUtils.setField(gear, "description", ReflectionTestUtils.getField(req, "description"));
            ReflectionTestUtils.setField(gear, "category", ReflectionTestUtils.getField(req, "category"));
            ReflectionTestUtils.setField(gear, "condition", ReflectionTestUtils.getField(req, "condition"));
            ReflectionTestUtils.setField(gear, "quantity", ReflectionTestUtils.getField(req, "quantity"));
            return null;
        }).when(modelMapper).map(any(GearRequest.class), any(Gear.class));

        when(modelMapper.map(any(GearRequest.class), any())).thenAnswer(invocation -> {
            GearRequest req = invocation.getArgument(0);
            Gear gear = new Gear();
            ReflectionTestUtils.setField(gear, "name", ReflectionTestUtils.getField(req, "name"));
            ReflectionTestUtils.setField(gear, "description", ReflectionTestUtils.getField(req, "description"));
            ReflectionTestUtils.setField(gear, "category", ReflectionTestUtils.getField(req, "category"));
            ReflectionTestUtils.setField(gear, "condition", ReflectionTestUtils.getField(req, "condition"));
            ReflectionTestUtils.setField(gear, "quantity", ReflectionTestUtils.getField(req, "quantity"));
            return gear;
        });

        when(modelMapper.map(any(Gear.class), any())).thenAnswer(invocation -> {
            Gear gear = invocation.getArgument(0);
            GearResponse res = new GearResponse();
            ReflectionTestUtils.setField(res, "id", ReflectionTestUtils.getField(gear, "id"));
            ReflectionTestUtils.setField(res, "status", ReflectionTestUtils.getField(gear, "status"));
            ReflectionTestUtils.setField(res, "price", ReflectionTestUtils.getField(gear, "price"));
            return res;
        });
    }

    @Test
    void create_ShouldSetAvailable_WhenQuantityPositive() {
        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "4-person tent");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 3);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("20.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        when(gearRepository.save(any(Gear.class))).thenAnswer(invocation -> {
            Gear saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", "gear-1");
            return saved;
        });

        GearResponse response = gearService.create(request, "owner-1");

        assertEquals("gear-1", ReflectionTestUtils.getField(response, "id"));
        assertEquals(GearStatus.AVAILABLE, ReflectionTestUtils.getField(response, "status"));
        assertEquals(new BigDecimal("20.00"), ReflectionTestUtils.getField(response, "price"));
    }

    @Test
    void create_ShouldSetOutOfStock_WhenQuantityZero() {
        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "4-person tent");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 0);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("20.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        when(gearRepository.save(any(Gear.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GearResponse response = gearService.create(request, "owner-1");

        assertEquals(GearStatus.OUT_OF_STOCK, ReflectionTestUtils.getField(response, "status"));
    }

    @Test
    void create_ShouldThrow_WhenDailyPriceMissingForRent() {
        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "4-person tent");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 2);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        assertThrows(BadRequestException.class, () -> gearService.create(request, "owner-1"));
    }

    @Test
    void update_ShouldThrow_WhenRequesterIsNotOwner() {
        Gear existing = new Gear();
        ReflectionTestUtils.setField(existing, "id", "gear-1");
        ReflectionTestUtils.setField(existing, "ownerId", "owner-1");
        ReflectionTestUtils.setField(existing, "deleted", false);

        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Updated");
        ReflectionTestUtils.setField(request, "description", "Updated desc");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 1);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("18.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        when(gearRepository.findById("gear-1")).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> gearService.update("gear-1", request, "owner-2"));
    }

    @Test
    void update_ShouldMoveToOutOfStock_WhenQuantityBecomesZero() {
        Gear existing = new Gear();
        ReflectionTestUtils.setField(existing, "id", "gear-1");
        ReflectionTestUtils.setField(existing, "ownerId", "owner-1");
        ReflectionTestUtils.setField(existing, "deleted", false);
        ReflectionTestUtils.setField(existing, "status", GearStatus.AVAILABLE);
        ReflectionTestUtils.setField(existing, "quantity", 2);

        GearRequest request = new GearRequest();
        ReflectionTestUtils.setField(request, "name", "Tent");
        ReflectionTestUtils.setField(request, "description", "4-person tent");
        ReflectionTestUtils.setField(request, "category", "Tents");
        ReflectionTestUtils.setField(request, "condition", "Good");
        ReflectionTestUtils.setField(request, "quantity", 0);
        ReflectionTestUtils.setField(request, "listingType", ListingType.FOR_RENT);
        ReflectionTestUtils.setField(request, "dailyPrice", new BigDecimal("20.00"));
        ReflectionTestUtils.setField(request, "imageUrls", List.of("https://img.com/1.jpg"));

        when(gearRepository.findById("gear-1")).thenReturn(Optional.of(existing));
        when(gearRepository.save(any(Gear.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GearResponse response = gearService.update("gear-1", request, "owner-1");

        assertEquals(GearStatus.OUT_OF_STOCK, ReflectionTestUtils.getField(response, "status"));
    }

    @Test
    void findById_ShouldThrow_WhenMissing() {
        when(gearRepository.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> gearService.findById("missing"));
    }

    @Test
    void toResponse_ShouldPopulateOwnerName_WhenOwnerExists() {
        Gear gear = new Gear();
        ReflectionTestUtils.setField(gear, "id", "gear-1");
        ReflectionTestUtils.setField(gear, "name", "Tent");
        ReflectionTestUtils.setField(gear, "ownerId", "owner-1");

        User owner = new User("owner1", "owner@test.com", "pass", "Owner Name");
        ReflectionTestUtils.setField(owner, "id", "owner-1");

        when(userRepository.findById("owner-1")).thenReturn(Optional.of(owner));

        GearResponse response = gearService.toResponse(gear);

        assertEquals("Owner Name", ReflectionTestUtils.getField(response, "ownerName"));
    }

    @Test
    void softDelete_ShouldCascadeMaintenanceRecords() {
        Gear gear = new Gear();
        ReflectionTestUtils.setField(gear, "id", "gear-1");
        ReflectionTestUtils.setField(gear, "ownerId", "owner-1");
        ReflectionTestUtils.setField(gear, "deleted", false);

        MaintenanceRecord record = new MaintenanceRecord();
        ReflectionTestUtils.setField(record, "id", "mr-1");
        ReflectionTestUtils.setField(record, "deleted", false);

        when(gearRepository.findById("gear-1")).thenReturn(Optional.of(gear));
        when(maintenanceRecordRepository.findByGearId("gear-1")).thenReturn(List.of(record));

        gearService.softDelete("gear-1", "owner-1");

        assertTrue((Boolean) ReflectionTestUtils.getField(record, "deleted"));
        assertTrue((Boolean) ReflectionTestUtils.getField(gear, "deleted"));
        verify(maintenanceRecordRepository, times(1)).saveAll(any());
        verify(gearRepository, times(1)).save(gear);
    }

    @Test
    void getProviderStats_ShouldReturnZeros_WhenNoGearOwned() {
        when(gearRepository.findByOwnerIdAndDeletedFalse("owner-1")).thenReturn(List.of());

        ProviderStatsResponse response = gearService.getProviderStats("owner-1");

        assertEquals(0L, ReflectionTestUtils.getField(response, "totalProducts"));
        assertEquals(BigDecimal.ZERO, ReflectionTestUtils.getField(response, "totalRevenue"));
        assertEquals(0L, ReflectionTestUtils.getField(response, "activeRentals"));
        assertEquals(0L, ReflectionTestUtils.getField(response, "pendingRequests"));
    }

    @Test
    void getProviderStats_ShouldAggregateCountsAndRevenue() {
        Gear g1 = new Gear();
        ReflectionTestUtils.setField(g1, "id", "g1");
        Gear g2 = new Gear();
        ReflectionTestUtils.setField(g2, "id", "g2");

        Purchase p1 = new Purchase();
        ReflectionTestUtils.setField(p1, "totalPrice", new BigDecimal("100.00"));
        Purchase p2 = new Purchase();
        ReflectionTestUtils.setField(p2, "totalPrice", new BigDecimal("50.00"));

        when(gearRepository.findByOwnerIdAndDeletedFalse("owner-1")).thenReturn(List.of(g1, g2));
        when(rentalRepository.countByGearIdInAndStatus(List.of("g1", "g2"), RentalStatus.ACTIVE)).thenReturn(2L);
        when(rentalRepository.countByGearIdInAndStatus(List.of("g1", "g2"), RentalStatus.PENDING)).thenReturn(1L);
        when(purchaseRepository.findByGearIdIn(List.of("g1", "g2"))).thenReturn(List.of(p1, p2));

        ProviderStatsResponse response = gearService.getProviderStats("owner-1");

        assertEquals(2L, ReflectionTestUtils.getField(response, "totalProducts"));
        assertEquals(2L, ReflectionTestUtils.getField(response, "activeRentals"));
        assertEquals(1L, ReflectionTestUtils.getField(response, "pendingRequests"));
        assertEquals(new BigDecimal("150.00"), ReflectionTestUtils.getField(response, "totalRevenue"));
    }
}
