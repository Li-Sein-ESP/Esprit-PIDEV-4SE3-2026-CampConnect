package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.gear.dto.*;
import com.campconnect.gear.model.*;
import com.campconnect.gear.repository.GearInventoryRepository;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.MaintenanceRecordRepository;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.gear.repository.RentalRepository;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GearService {

    private final GearRepository gearRepository;
    private final UserRepository userRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ModelMapper modelMapper;
    private final RentalRepository rentalRepository;
    private final PurchaseRepository purchaseRepository;
    private final WarehouseRepository warehouseRepository;
    private final GearInventoryRepository gearInventoryRepository;
    private final GearInventoryService gearInventoryService;

    // ---------- READ ----------

    public PagedResponse<GearResponse> findAll(GearStatus status, String category, String query, Pageable pageable) {
        Page<Gear> page;
        if (query != null && !query.trim().isEmpty()) {
            page = gearRepository.searchByTextAndDeletedFalse(query, pageable);
        } else if (status != null && category != null) {
            page = gearRepository.findByStatusAndCategoryAndDeletedFalse(status, category, pageable);
        } else if (status != null) {
            page = gearRepository.findByStatusAndDeletedFalse(status, pageable);
        } else if (category != null) {
            page = gearRepository.findByCategoryAndDeletedFalse(category, pageable);
        } else {
            page = gearRepository.findByDeletedFalse(pageable);
        }
        return PagedResponse.from(page.map(this::toResponse));
    }

    public GearResponse findById(String id) {
        Gear gear = gearRepository.findById(id)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", id));
        return toResponse(gear);
    }

    public PagedResponse<GearResponse> findByOwner(String ownerId, Pageable pageable) {
        Page<Gear> page = gearRepository.findByOwnerIdAndDeletedFalse(ownerId, pageable);
        return PagedResponse.from(page.map(this::toResponse));
    }

    // ---------- WRITE ----------

    @Transactional
    public GearResponse create(GearRequest request, String ownerId) {

        validatePricing(request);

        if (!warehouseRepository.existsByProviderIdAndDeletedFalse(ownerId)) {
            throw new BadRequestException("You must create at least one warehouse before adding gear.");
        }

        Gear gear = modelMapper.map(request, Gear.class);
        gear.setOwnerId(ownerId);
        gear.setDeleted(false);
        gear.setListingType(request.getListingType());
        gear.setDailyPrice(request.getDailyPrice());
        gear.setSalePrice(request.getSalePrice());
        // Explicitly set weightKg (primitive field with default 0.0)
        if (request.getWeightKg() != null) {
            gear.setWeightKg(request.getWeightKg());
        }
        // Keep backward-compat: price = dailyPrice (used by rental logic)
        if (request.getDailyPrice() != null) {
            gear.setPrice(request.getDailyPrice());
        } else if (request.getPrice() != null) {
            gear.setPrice(request.getPrice());
        }

        if (request.getImageUrls() != null) {
            request.getImageUrls().forEach(url -> gear.getImages().add(new GearImage(url)));
        }

        // Respect explicit status from request; otherwise derive from quantity
        if (request.getStatus() != null) {
            gear.setStatus(request.getStatus());
        } else if (request.getQuantity() == 0) {
            gear.setStatus(GearStatus.OUT_OF_STOCK);
        } else {
            gear.setStatus(GearStatus.AVAILABLE);
        }

        Gear savedGear = gearRepository.save(gear);

        if (request.getQuantity() > 0) {
            List<Warehouse> warehouses = warehouseRepository.findByProviderIdAndDeletedFalse(ownerId);
            if (!warehouses.isEmpty()) {
                GearInventory inv = new GearInventory();
                inv.setGearId(savedGear.getId());
                inv.setWarehouseId(warehouses.get(0).getId());
                inv.setQuantity(request.getQuantity());
                gearInventoryRepository.save(inv);
            }
        }

        return toResponse(savedGear);
    }

    @Transactional
    public GearResponse update(String id, GearRequest request, String requesterId) {
        Gear gear = gearRepository.findById(id)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", id));

        if (!gear.getOwnerId().equals(requesterId)) {
            throw new BadRequestException("You are not the owner of this gear");
        }

        validatePricing(request);

        if (request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Price cannot be negative");
        }

        modelMapper.map(request, gear);
        gear.setListingType(request.getListingType());
        gear.setDailyPrice(request.getDailyPrice());
        gear.setSalePrice(request.getSalePrice());
        // Explicitly set weightKg
        if (request.getWeightKg() != null) {
            gear.setWeightKg(request.getWeightKg());
        }
        if (request.getDailyPrice() != null) {
            gear.setPrice(request.getDailyPrice());
        } else if (request.getPrice() != null) {
            gear.setPrice(request.getPrice());
        }

        int totalStock = gearInventoryService.getTotalStock(gear.getId());

        // Re-evaluate status from real inventory stock (except explicit maintenance)
        if (gear.getStatus() != GearStatus.MAINTENANCE) {
            if (totalStock <= 0 && gear.getStatus() == GearStatus.AVAILABLE) {
                gear.setStatus(GearStatus.OUT_OF_STOCK);
            } else if (totalStock > 0 && gear.getStatus() == GearStatus.OUT_OF_STOCK) {
                gear.setStatus(GearStatus.AVAILABLE);
            }
        }

        return toResponse(gearRepository.save(gear));
    }

    @Transactional
    public void softDelete(String id, String requesterId) {
        Gear gear = gearRepository.findById(id)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", id));

        if (!gear.getOwnerId().equals(requesterId)) {
            throw new BadRequestException("You are not the owner of this gear");
        }

        // Soft-delete cascade to maintenance records
        List<MaintenanceRecord> records = maintenanceRecordRepository.findByGearId(id);
        records.forEach(r -> r.setDeleted(true));
        maintenanceRecordRepository.saveAll(records);

        gear.setDeleted(true);
        gearRepository.save(gear);
    }

    @Transactional
    public GearResponse addImage(String gearId, String imageUrl, String requesterId) {
        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        if (!gear.getOwnerId().equals(requesterId)) {
            throw new BadRequestException("You are not the owner of this gear");
        }

        gear.getImages().add(new GearImage(imageUrl));
        return toResponse(gearRepository.save(gear));
    }

    @Transactional
    public GearResponse removeImage(String gearId, String imageId, String requesterId) {
        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        if (!gear.getOwnerId().equals(requesterId)) {
            throw new BadRequestException("You are not the owner of this gear");
        }

        boolean removed = gear.getImages().removeIf(img -> img.getId().equals(imageId));
        if (!removed) {
            throw new ResourceNotFoundException("Image", "id", imageId);
        }

        return toResponse(gearRepository.save(gear));
    }

    // ---------- VALIDATION ----------

    private void validatePricing(GearRequest request) {
        ListingType type = request.getListingType();
        if (type == null) {
            throw new BadRequestException("Listing type is required.");
        }
        boolean needsDaily = type == ListingType.FOR_RENT || type == ListingType.BOTH;
        boolean needsSale = type == ListingType.FOR_SALE || type == ListingType.BOTH;
        if (needsDaily && request.getDailyPrice() == null) {
            throw new BadRequestException("Daily rental price is required for listing type " + type + ".");
        }
        if (needsSale && request.getSalePrice() == null) {
            throw new BadRequestException("Sale price is required for listing type " + type + ".");
        }
    }

    // ---------- MAPPING ----------

    public GearResponse toResponse(Gear gear) {
        GearResponse response = modelMapper.map(gear, GearResponse.class);

        // Enrich with owner name
        if (gear.getOwnerId() != null) {
            userRepository.findById(gear.getOwnerId())
                    .ifPresent(u -> response.setOwnerName(u.getName()));
        }

        // Map embedded images
        if (gear.getImages() != null) {
            response.setImages(gear.getImages().stream()
                    .map(img -> new GearImageDto(img.getId(), img.getImageUrl()))
                    .collect(Collectors.toList()));
        }

        int totalStock = gearInventoryService.getTotalStock(gear.getId());
        response.setQuantity(totalStock);
        if (response.getStatus() != GearStatus.MAINTENANCE) {
            if (totalStock > 0) {
                response.setStatus(GearStatus.AVAILABLE);
            } else {
                response.setStatus(GearStatus.OUT_OF_STOCK);
            }
        }

        return response;
    }

    public GearAnalyticsResponse getGearAnalytics(String gearId) {
        Gear gear = gearRepository.findById(gearId)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

        GearAnalyticsResponse resp = new GearAnalyticsResponse();
        resp.setGearId(gear.getId());
        resp.setGearName(gear.getName());
        resp.setTotalRentals(rentalRepository.countByGearId(gearId));
        resp.setTotalPurchases(purchaseRepository.countByGearId(gearId));

        // Revenue from purchases only (rentals don't store total price)
        List<Purchase> purchases = purchaseRepository.findByGearIdIn(List.of(gearId));
        BigDecimal revenue = purchases.stream()
                .map(Purchase::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setTotalRevenue(revenue);

        resp.setAverageRating(0.0); // No review system yet
        resp.setActiveRentals((int) rentalRepository.countByGearIdAndStatusIn(
                gearId, List.of(RentalStatus.ACTIVE, RentalStatus.APPROVED)));
        resp.setAvailableStock(gearInventoryService.getTotalStock(gearId));

        return resp;
    }

    public ProviderStatsResponse getProviderStats(String ownerId) {
        List<Gear> gearItems = gearRepository.findByOwnerIdAndDeletedFalse(ownerId);
        List<String> gearIds = gearItems.stream().map(Gear::getId).collect(Collectors.toList());

        ProviderStatsResponse resp = new ProviderStatsResponse();
        resp.setTotalProducts(gearItems.size());

        if (gearIds.isEmpty()) {
            resp.setTotalRevenue(BigDecimal.ZERO);
            resp.setActiveRentals(0);
            resp.setPendingRequests(0);
            resp.setAverageRating(0.0);
            return resp;
        }

        resp.setActiveRentals(rentalRepository.countByGearIdInAndStatus(gearIds, RentalStatus.ACTIVE));
        resp.setPendingRequests(rentalRepository.countByGearIdInAndStatus(gearIds, RentalStatus.PENDING));

        List<Purchase> allPurchases = purchaseRepository.findByGearIdIn(gearIds);
        BigDecimal revenue = allPurchases.stream()
                .map(Purchase::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setTotalRevenue(revenue);
        resp.setAverageRating(0.0);

        return resp;
    }

    /**
     * Returns all non-cancelled booked date ranges for a gear item.
     * Uses the proven findByGearIdAndStatusIn to avoid any @Query deserialization issues.
     */
    public List<BookedDateRange> getBookedDates(String gearId) {
        List<RentalStatus> activeStatuses = Arrays.asList(
                RentalStatus.PENDING,
                RentalStatus.APPROVED,
                RentalStatus.ACTIVE,
                RentalStatus.COMPLETED
        );
        return rentalRepository.findByGearIdAndStatusIn(gearId, activeStatuses)
                .stream()
                .filter(r -> r.getStartDate() != null && r.getEndDate() != null)
                .map(r -> new BookedDateRange(r.getStartDate(), r.getEndDate()))
                .collect(Collectors.toList());
    }
}
