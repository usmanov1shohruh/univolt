import { mapTokborStatus, mapTokborConnectorTypes, mapTokborPoint } from '../../scripts/merge-tokbor-from-json.cjs';

describe('Tokbor mapping helpers', () => {
  it('maps statuses to StationStatus', () => {
    expect(mapTokborStatus('AVAILABLE')).toBe('available');
    expect(mapTokborStatus('MAINTENANCE')).toBe('maintenance');
    expect(mapTokborStatus('UNAVAILABLE')).toBe('offline');
    expect(mapTokborStatus('EMERGENCY_STOP')).toBe('offline');
    expect(mapTokborStatus('SOMETHING_ELSE')).toBe('unknown');
  });

  it('maps connector types from Tokbor type', () => {
    expect(mapTokborConnectorTypes('AC')).toEqual(['Type2']);
    expect(mapTokborConnectorTypes('DC')).toEqual(['CCS2']);
    expect(mapTokborConnectorTypes('HYBRID')).toEqual(['CCS2', 'Type2']);
    expect(mapTokborConnectorTypes('ULTRA')).toEqual(['CCS2']);
    expect(mapTokborConnectorTypes('UNKNOWN')).toEqual([]);
  });

  it('maps a full Tokbor point into Station shape', () => {
    const raw = {
      discounted: true,
      icon: { left: true, right: false, bottom: null },
      status: 'AVAILABLE',
      id: 990,
      lat: 41.33682,
      lng: 69.27519,
      hasTaxiDiscount: false,
      type: 'DC',
    };

    const mapped = mapTokborPoint(raw);

    expect(mapped.id).toBe('tokbor-990');
    expect(mapped.source).toBe('tokbor');
    expect(mapped.sourceStationId).toBe('990');
    expect(mapped.latitude).toBeCloseTo(41.33682, 6);
    expect(mapped.longitude).toBeCloseTo(69.27519, 6);
    expect(mapped.network).toBe('Tok Bor');
    expect(mapped.status).toBe('available');
    expect(mapped.isDiscounted).toBe(true);
    expect(mapped.hasTaxiDiscount).toBe(false);
    expect(mapped.iconLeft).toBe(true);
    expect(mapped.iconRight).toBe(false);
    expect(mapped.iconBottom).toBeNull();
  });
}

