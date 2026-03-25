import type {
  Station,
  Filters,
  AvailabilityStatus,
  ConnectorType,
  ChargingSpeed,
} from '@/types/station';

/** Absolute URL or same-origin path. Honors Vite BASE_URL so mini-app under a subpath still hits the API. */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const appBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const suffix = '/_/backend';
  if (!appBase) return suffix;
  return `${appBase}${suffix}`;
}

const API_BASE_URL = resolveApiBaseUrl();

/** Same JSON shape as GET /stations; deployed as a static file when serverless API path fails (e.g. Telegram mini app). */
function staticStationsSnapshotUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return new URL('stations.json', new URL(base, window.location.origin).href).href;
}

async function fetchBackendStationsJson(url: string): Promise<BackendStation[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch stations: ${res.status}`);
  }
  return (await res.json()) as BackendStation[];
}

type BackendStationStatus = 'available' | 'busy' | 'offline' | 'unknown';

interface BackendStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  network: string;
  connectorTypes: string[];
  maxPowerKw: number | null;
  portsCount: number | null;
  status: BackendStationStatus;
  openingHours: string | null;
}

export interface StationsQueryParams {
  search?: string;
  network?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
  status?: AvailabilityStatus;
}

function mapBackendStatusToAvailability(status: BackendStationStatus): AvailabilityStatus {
  switch (status) {
    case 'available':
      return 'available';
    case 'busy':
      return 'busy';
    case 'offline':
      return 'unknown';
    case 'unknown':
    default:
      return 'unknown';
  }
}

/** District label from catalog address, e.g. "Toshkent, Yunusobod tumani, ..." */
export function parseDistrictFromAddress(address: string): string {
  if (!address?.trim()) return '';
  const m = address.match(/,\s*([^,]+?)\s+tumani\b/i);
  if (m) return m[1].trim();
  const m2 = address.match(/\b([^,]+)\s+tumani\b/i);
  return m2 ? m2[1].trim() : '';
}

function chargingSpeedFromKw(kw: number | null): ChargingSpeed {
  if (kw == null) return 'unknown';
  if (kw >= 120) return 'ultra_fast';
  if (kw >= 60) return 'fast_dc';
  if (kw >= 11) return 'medium';
  return 'slow_ac';
}

function mapBackendToFront(station: BackendStation): Station {
  const availability_status = mapBackendStatusToAvailability(station.status);
  const maxKw = station.maxPowerKw ?? null;

  return {
    id: station.id,
    name: station.name,
    operator: station.network || 'Unknown operator',
    address: station.address,
    district: parseDistrictFromAddress(station.address),
    latitude: station.latitude,
    longitude: station.longitude,
    connector_types: station.connectorTypes as ConnectorType[],
    max_power_kw: maxKw,
    charging_speed_category: chargingSpeedFromKw(maxKw),
    hours: station.openingHours ?? '',
    is_24_7: station.openingHours === '24/7',
    availability_status,
    ports_count: station.portsCount ?? null,
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
  };
}

export function buildStationsQueryParams(filters: Filters, searchQuery: string): StationsQueryParams {
  const params: StationsQueryParams = {};

  if (searchQuery.trim()) {
    params.search = searchQuery.trim();
  }

  if (filters.connector_types.length === 1) {
    params.connectorType = filters.connector_types[0];
  }

  if (filters.availability.length === 1) {
    params.status = filters.availability[0];
  }

  if (filters.operators.length === 1) {
    params.network = filters.operators[0];
  }

  return params;
}

export async function fetchStationsFromApi(params: StationsQueryParams): Promise<Station[]> {
  const baseUrl = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : new URL(API_BASE_URL, window.location.origin).toString();
  const url = new URL('stations', `${baseUrl.replace(/\/$/, '')}/`);

  if (params.search) url.searchParams.set('search', params.search);
  if (params.network) url.searchParams.set('network', params.network);
  if (params.connectorType) url.searchParams.set('connectorType', params.connectorType);
  if (typeof params.minPowerKw === 'number') {
    url.searchParams.set('minPowerKw', String(params.minPowerKw));
  }
  if (params.status) url.searchParams.set('status', params.status);

  let data: BackendStation[];
  try {
    data = await fetchBackendStationsJson(url.toString());
  } catch (apiErr) {
    try {
      data = await fetchBackendStationsJson(staticStationsSnapshotUrl());
      if (import.meta.env.DEV) {
        console.warn('[stations] API unreachable, loaded static snapshot', apiErr);
      }
    } catch {
      throw apiErr;
    }
  }
  return data.map(mapBackendToFront);
}

