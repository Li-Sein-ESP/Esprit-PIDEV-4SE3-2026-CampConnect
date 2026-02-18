// Safety Module Interfaces
export interface SafetyAlert {
    id: string;
    type: 'weather' | 'wildlife' | 'fire' | 'flood' | 'closure' | 'advisory';
    severity: 'info' | 'warning' | 'danger' | 'critical';
    title: string;
    description: string;
    location: {
        name: string;
        region: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    affectedAreas: string[];
    startDate: string;
    endDate?: string;
    source: string;
    updatedAt: string;
    active: boolean;
}

export interface WildlifeRegulation {
    id: string;
    location: string;
    species: string;
    regulation: string;
    season?: {
        start: string;
        end: string;
    };
    restrictions: string[];
    penalties: string;
    contactInfo?: {
        agency: string;
        phone: string;
        website: string;
    };
}

export interface EnvironmentalZone {
    id: string;
    name: string;
    type: 'protected' | 'restricted' | 'permit-required' | 'seasonal';
    location: {
        region: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    regulations: string[];
    permitRequired: boolean;
    permitInfo?: {
        cost: number;
        validityDays: number;
        howToObtain: string;
    };
    seasonalRestrictions?: {
        closedFrom: string;
        closedTo: string;
        reason: string;
    };
}

export interface EmergencyCheckin {
    id: string;
    userId: string;
    tripId: string;
    location: {
        lat: number;
        lng: number;
        accuracy: number;
    };
    status: 'safe' | 'help-needed' | 'emergency';
    message?: string;
    timestamp: string;
    emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    notified: boolean;
}

export interface ComplianceReport {
    tripId: string;
    location: string;
    checkDate: string;
    permits: PermitCheck[];
    regulations: RegulationCheck[];
    safetyItems: SafetyItemCheck[];
    overallStatus: 'compliant' | 'partial' | 'non-compliant';
    recommendations: string[];
}

export interface PermitCheck {
    name: string;
    required: boolean;
    obtained: boolean;
    expiryDate?: string;
    status: 'valid' | 'expired' | 'not-required' | 'missing';
}

export interface RegulationCheck {
    regulation: string;
    compliant: boolean;
    notes?: string;
}

export interface SafetyItemCheck {
    item: string;
    required: boolean;
    available: boolean;
    condition?: 'good' | 'fair' | 'poor';
}
