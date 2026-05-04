package com.campconnect.delivery.service;

import com.campconnect.delivery.dto.ProofOfDeliveryRequest;
import com.campconnect.delivery.dto.ProofOfDeliveryResponse;
import com.campconnect.delivery.model.Delivery;
import com.campconnect.delivery.model.DeliveryStatus;
import com.campconnect.delivery.model.ProofOfDelivery;
import com.campconnect.delivery.repository.DeliveryRepository;
import com.campconnect.delivery.repository.ProofOfDeliveryRepository;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ConflictException;
import com.campconnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProofOfDeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final ProofOfDeliveryRepository proofRepository;

    @Transactional
    public ProofOfDeliveryResponse submit(String deliveryId, ProofOfDeliveryRequest request) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        if (delivery.getStatus() != DeliveryStatus.DELIVERED) {
            throw new BadRequestException(
                "Proof of delivery can only be submitted for DELIVERED deliveries. Current status: "
                        + delivery.getStatus());
        }

        if (proofRepository.existsByDeliveryId(deliveryId)) {
            throw new ConflictException("Proof of delivery already exists for delivery: " + deliveryId);
        }

        ProofOfDelivery proof = new ProofOfDelivery();
        proof.setDeliveryId(deliveryId);
        proof.setRecipientName(request.getRecipientName());
        proof.setSignatureDataUrl(request.getSignatureDataUrl());
        proof.setPhotoUrl(request.getPhotoUrl());
        proof.setNotes(request.getNotes());

        ProofOfDelivery saved = proofRepository.save(proof);
        return toResponse(saved);
    }

    public ProofOfDeliveryResponse getByDeliveryId(String deliveryId) {
        return proofRepository.findByDeliveryId(deliveryId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ProofOfDelivery", "deliveryId", deliveryId));
    }

    private ProofOfDeliveryResponse toResponse(ProofOfDelivery proof) {
        return ProofOfDeliveryResponse.builder()
                .id(proof.getId())
                .deliveryId(proof.getDeliveryId())
                .recipientName(proof.getRecipientName())
                .signatureDataUrl(proof.getSignatureDataUrl())
                .photoUrl(proof.getPhotoUrl())
                .notes(proof.getNotes())
                .createdAt(proof.getCreatedAt())
                .build();
    }
}
