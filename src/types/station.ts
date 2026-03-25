export type ConnectorType = 'CCS2' | 'GB/T' | 'Type2' | 'CHAdeMO' | 'J1772';
export type ChargingSpeed = 'slow_ac' | 'medium' | 'fast_dc' | 'ultra_fast' | 'unknown';
export type AvailabilityStatus = 'available' | 'busy' | 'unknown' | 'limited';
export type ParkingType = 'mall' | 'hotel' | 'business_center' | 'residential' | 'standalone' | 'gas_station';
export type Amenity = 'cafe' | 'parking' | 'restroom' | 'security' | 'shopping' | 'hotel' | 'wifi' | 'waiting_area';
export type SourceType = 'parsed' | 'manual' | 'mock';

export interface Station {
  id: string;
  name: string;
  operator: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  connector_types: ConnectorType[];
  max_power_kw: number | null;
  charging_speed_category: ChargingSpeed;
  hours: string;
  is_24_7: boolean;
  availability_status: AvailabilityStatus;
  ports_count: number | null;
  parking_type: ParkingType;
  payment_info_text: string;
  access_notes: string;
  amenities: Amenity[];
  photos: string[];
  is_verified: boolean;
  last_updated_text: string;
  short_description: string;
  route_url: string;
  source_type: SourceType;
  confidence_level: number;
  pricing_info?: string;
  how_to_find?: string;
  good_to_know?: string;
}

export interface Filters {
  connector_types: ConnectorType[];
  charging_speeds: ChargingSpeed[];
  availability: AvailabilityStatus[];
  is_24_7: boolean | null;
  parking_types: ParkingType[];
  operators: string[];
  districts: string[];
}

export const defaultFilters: Filters = {
  connector_types: [],
  charging_speeds: [],
  availability: [],
  is_24_7: null,
  parking_types: [],
  operators: [],
  districts: [],
};
