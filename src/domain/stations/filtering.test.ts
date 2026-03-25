import { describe, it, expect } from 'vitest';
import { filterStations, countActiveFilters } from './filtering';
import type { Filters, Station } from '@/types/station';
import { defaultFilters } from '@/types/station';

function makeStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 'st-0',
    name: 'Test Station',
    operator: 'Test Operator',
    address: 'Toshkent, Test tumani',
    district: 'Test tumani',
    latitude: 41.0,
    longitude: 69.0,
    connector_types: ['CCS2'],
    max_power_kw: 60,
    charging_speed_category: 'fast_dc',
    hours: '',
    is_24_7: false,
    availability_status: 'available',
    ports_count: 2,
    parking_type: 'standalone',
    payment_info_text: '',
    access_notes: '',
    amenities: [],
    photos: [],
    is_verified: false,
    last_updated_text: '',
    short_description: '',
    route_url: '',
    source_type: 'parsed',
    confidence_level: 0.5,
    ...overrides,
  };
}

describe('filterStations', () => {
  it('filters by connector_types', () => {
    const stations: Station[] = [
      makeStation({ id: 'a', connector_types: ['CCS2'] }),
      makeStation({ id: 'b', connector_types: ['Type2'] }),
    ];

    const filters: Filters = {
      ...defaultFilters,
      connector_types: ['CCS2'],
    };

    const result = filterStations(stations, filters, '');
    expect(result.map((s) => s.id)).toEqual(['a']);
  });

  it('filters by 24/7 flag when set', () => {
    const stations: Station[] = [
      makeStation({ id: 'a', is_24_7: true }),
      makeStation({ id: 'b', is_24_7: false }),
    ];

    const filters: Filters = {
      ...defaultFilters,
      is_24_7: true,
    };

    const result = filterStations(stations, filters, '');
    expect(result.map((s) => s.id)).toEqual(['a']);
  });

  it('filters by district', () => {
    const stations: Station[] = [
      makeStation({ id: 'a', district: 'Yunusobod' }),
      makeStation({ id: 'b', district: 'Chilonzor' }),
    ];

    const filters: Filters = {
      ...defaultFilters,
      districts: ['Chilonzor'],
    };

    const result = filterStations(stations, filters, '');
    expect(result.map((s) => s.id)).toEqual(['b']);
  });
});

describe('countActiveFilters', () => {
  it('counts only active dimensions', () => {
    const filters: Filters = {
      ...defaultFilters,
      connector_types: ['CCS2'],
      charging_speeds: ['fast_dc'],
      availability: ['busy'],
      is_24_7: null,
      parking_types: ['standalone'],
      operators: ['Op1'],
      districts: [],
    };

    // connector_types + charging_speeds + availability + parking_types + operators
    expect(countActiveFilters(filters)).toBe(5);
  });
});

