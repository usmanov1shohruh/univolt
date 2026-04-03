import { describe, expect, it } from 'vitest';
import {
  BackendStationsResponseSchema,
  mapBackendToFront,
  BackendStationSchema,
} from './stationsApi';

describe('stationsApi contract', () => {
  const baseBackendStation = {
    id: 'st-1',
    name: 'Test Station',
    address: 'Toshkent, Test tumani',
    latitude: 41.3,
    longitude: 69.2,
    network: 'TestNet',
    connectorTypes: ['CCS2'] as const,
    maxPowerKw: 60,
    portsCount: 2,
    status: 'available' as const,
    openingHours: '24/7',
  };

  it('rejects unknown backend connector types', () => {
    const bad = [
      {
        ...baseBackendStation,
        // Frontend supports J1772, but backend connector set is limited
        connectorTypes: ['J1772'],
      },
    ];

    expect(() => BackendStationsResponseSchema.parse(bad)).toThrow();
  });

  it('maps backend "Other" out of frontend connector_types', () => {
    const backendStation = BackendStationSchema.parse({
      ...baseBackendStation,
      connectorTypes: ['CCS2', 'Other'],
    });

    const front = mapBackendToFront(backendStation);
    expect(front.connector_types).toEqual(['CCS2']);
  });

  it('maps backend offline/unavailable to frontend "unknown"', () => {
    const backendStation = BackendStationSchema.parse({
      ...baseBackendStation,
      status: 'offline',
    });

    const front = mapBackendToFront(backendStation);
    expect(front.availability_status).toBe('unknown');
  });

  it('accepts maintenance from seed/Tokbor and maps to limited', () => {
    const backendStation = BackendStationSchema.parse({
      ...baseBackendStation,
      status: 'maintenance',
    });
    const front = mapBackendToFront(backendStation);
    expect(front.availability_status).toBe('limited');
  });
});

