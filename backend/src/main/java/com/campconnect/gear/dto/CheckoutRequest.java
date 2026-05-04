package com.campconnect.gear.dto;

import com.campconnect.delivery.model.DeliveryMethod;
import com.campconnect.delivery.model.DeliveryType;
import lombok.Data;

@Data
public class CheckoutRequest {
    /** DELIVERY or PICKUP */
    private DeliveryMethod deliveryMethod;

    /** EXPRESS or NORMAL (only when deliveryMethod=DELIVERY) */
    private DeliveryType deliveryType;

    /** Customer delivery address (only when deliveryMethod=DELIVERY) */
    private String deliveryAddress;
    private Double customerLat;
    private Double customerLng;

    /** Selected warehouse for pickup (only when deliveryMethod=PICKUP) */
    private String pickupWarehouseId;
}
