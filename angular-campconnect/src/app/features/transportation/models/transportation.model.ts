// Transportation Module Interfaces
export interface TransportRoute {
    id: string;
    origin: Location;
    destination: Location;
    distance: number;
    duration: number;
    mode: 'car' | 'bus' | 'train' | 'flight' | 'carpool';
    price?: number;
    provider?: string;
}

export interface Location {
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface RouteSegment {
    id: string;
    from: Location;
    to: Location;
    distance: number;
    duration: number;
    mode: 'car' | 'bus' | 'train' | 'flight' | 'walk';
    instructions?: string[];
    stops?: Location[];
}

export interface TransportBooking {
    id: string;
    routeId: string;
    userId: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    totalPrice: number;
    bookingReference?: string;
}

export interface VehicleRental {
    id: string;
    type: 'car' | 'van' | 'rv' | 'motorcycle';
    make: string;
    model: string;
    year: number;
    capacity: number;
    pricePerDay: number;
    features: string[];
    imageUrl: string;
    available: boolean;
}

export interface FuelEstimate {
    distance: number;
    fuelEfficiency: number;
    fuelPrice: number;
    totalCost: number;
    co2Emissions: number;
}
