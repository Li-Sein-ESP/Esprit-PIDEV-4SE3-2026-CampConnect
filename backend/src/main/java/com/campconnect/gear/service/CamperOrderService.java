package com.campconnect.gear.service;

import com.campconnect.common.PagedResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.gear.dto.CamperOrderSummaryDto;
import com.campconnect.gear.model.Purchase;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.PurchaseRepository;
import com.campconnect.gear.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CamperOrderService {

    private final RentalRepository rentalRepository;
    private final PurchaseRepository purchaseRepository;
    private final DeliveryRepository deliveryRepository;
    private final GearRepository gearRepository;

    /**
     * Returns a unified, date-sorted list of all rentals and purchases for a camper,
     * enriched with their delivery status and gear image.
     */
    public PagedResponse<CamperOrderSummaryDto> getMyOrders(String userId, Pageable pageable) {
        List<Rental> rentals = rentalRepository.findByRenterId(userId);
        List<Purchase> purchases = purchaseRepository.findByBuyerId(userId);

        // Build a delivery map keyed by rentalId or purchaseId for O(1) lookups
        List<Delivery> deliveries = deliveryRepository.findByCamperUserIdAndDeletedFalse(userId);
        Map<String, Delivery> deliveryByRentalId = deliveries.stream()
                .filter(d -> d.getRentalId() != null)
                .collect(Collectors.toMap(Delivery::getRentalId, d -> d, (a, b) -> a));
        Map<String, Delivery> deliveryByPurchaseId = deliveries.stream()
                .filter(d -> d.getPurchaseId() != null)
                .collect(Collectors.toMap(Delivery::getPurchaseId, d -> d, (a, b) -> a));

        // Map rentals → CamperOrderSummaryDto
        List<CamperOrderSummaryDto> rentalDtos = rentals.stream().map(r -> {
            Delivery d = deliveryByRentalId.get(r.getId());
            String imageUrl = resolveGearImage(r.getGearId());
            return CamperOrderSummaryDto.builder()
                    .orderId(r.getId())
                    .orderType("RENTAL")
                    .gearId(r.getGearId())
                    .gearName(r.getGearName())
                    .gearImageUrl(imageUrl)
                    .startDate(r.getStartDate())
                    .endDate(r.getEndDate())
                    .rentalDays(r.getRentalDays())
                    .totalPrice(r.getTotalPrice())
                    .discountApplied(r.getDiscountApplied() != null ? r.getDiscountApplied() : BigDecimal.ZERO)
                    .deliveryStatus(d != null ? toCamperStatus(d.getStatus()) : null)
                    .rawDeliveryStatus(d != null ? d.getStatus().name() : null)
                    .createdAt(r.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        // Map purchases → CamperOrderSummaryDto
        List<CamperOrderSummaryDto> purchaseDtos = purchases.stream().map(p -> {
            Delivery d = deliveryByPurchaseId.get(p.getId());
            String imageUrl = resolveGearImage(p.getGearId());
            return CamperOrderSummaryDto.builder()
                    .orderId(p.getId())
                    .orderType("PURCHASE")
                    .gearId(p.getGearId())
                    .gearName(p.getGearName())
                    .gearImageUrl(imageUrl)
                    .totalPrice(p.getTotalPrice())
                    .discountApplied(p.getDiscountApplied() != null ? p.getDiscountApplied() : BigDecimal.ZERO)
                    .deliveryStatus(d != null ? toCamperStatus(d.getStatus()) : null)
                    .rawDeliveryStatus(d != null ? d.getStatus().name() : null)
                    .createdAt(p.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        // Merge and sort by createdAt DESC
        List<CamperOrderSummaryDto> all = Stream.concat(rentalDtos.stream(), purchaseDtos.stream())
                .sorted(Comparator.comparing(CamperOrderSummaryDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        // Manual pagination
        int total = all.size();
        int pageNum = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int start = Math.min(pageNum * pageSize, total);
        int end = Math.min(start + pageSize, total);
        List<CamperOrderSummaryDto> pageContent = all.subList(start, end);

        PagedResponse<CamperOrderSummaryDto> response = new PagedResponse<>();
        response.setContent(pageContent);
        response.setPage(pageNum);
        response.setSize(pageSize);
        response.setTotalElements(total);
        response.setTotalPages((int) Math.ceil((double) total / pageSize));
        response.setLast(end >= total);
        return response;
    }

    /** Maps backend DeliveryStatus → simplified 5-step camper label. */
    public static String toCamperStatus(DeliveryStatus status) {
        if (status == null) return null;
        return switch (status) {
            case CREATED, PENDING -> "Pending";
            case ASSIGNED, DISPATCHED -> "Assigned";
            case PICKED_UP -> "Picked Up";
            case IN_TRANSIT -> "In Transit";
            case DELIVERED -> "Delivered";
            case FAILED, CANCELLED -> "Cancelled";
        };
    }

    private String resolveGearImage(String gearId) {
        if (gearId == null) return null;
        return gearRepository.findById(gearId)
                .filter(g -> g.getImages() != null && !g.getImages().isEmpty())
                .map(g -> g.getImages().get(0).getImageUrl())
                .orElse(null);
    }
}
