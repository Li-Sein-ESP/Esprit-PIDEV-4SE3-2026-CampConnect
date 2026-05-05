package com.campconnect.transport.dto;

import lombok.Data;

import java.time.Instant;

/**
 * Payload pour simuler un retard (tests PIDEV / lab) sans passer par un TransportDTO complet.
 */
@Data
public class TransportDelayTestRequest {
    /** Si ≤ 0 : transport remis AVAILABLE et retard effacé. */
    private int delayMinutes;
    /** Optionnel : fixe l’heure de départ (ex. déclencher la fenêtre « rappel 1 h »). */
    private Instant departureTime;
}
