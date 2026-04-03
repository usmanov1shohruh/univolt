import type {
  Station,
  Filters,
  AvailabilityStatus,
  ConnectorType,
  ChargingSpeed,
} from '@/types/station';
import { z } from 'zod';

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

export interface BackendStationsPage {
  items: BackendStation[];
  total: number;
}

async function fetchBackendStationsJson(url: string): Promise<BackendStationsPage> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch stations: ${res.status}`);
  }
  const json = await res.json();
  const parsed = BackendStationsResponseSchema.parse(json);
  if (Array.isArray(parsed)) {
    return { items: parsed, total: parsed.length };
  }
  return parsed;
}

export const BackendConnectorTypeSchema = z.enum(['CCS2', 'CHAdeMO', 'Type2', 'GB/T', 'Other']);
export type BackendConnectorType = z.infer<typeof BackendConnectorTypeSchema>;

export const BackendStationStatusSchema = z.enum(['available', 'busy', 'offline', 'unknown']);
export type BackendStationStatus = z.infer<typeof BackendStationStatusSchema>;

export const BackendStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  network: z.string(),
  connectorTypes: z.array(BackendConnectorTypeSchema),
  maxPowerKw: z.number().nullable(),
  portsCount: z.number().nullable(),
  status: BackendStationStatusSchema,
  openingHours: z.string().nullable(),
});
export type BackendStation = z.infer<typeof BackendStationSchema>;

const BackendStationsArrayResponseSchema = z.array(BackendStationSchema);
export const BackendStationsPageResponseSchema = z.object({
  items: BackendStationsArrayResponseSchema,
  total: z.number().int().nonnegative(),
});
export const BackendStationsResponseSchema = z.union([
  BackendStationsPageResponseSchema,
  BackendStationsArrayResponseSchema,
]);

export interface StationsQueryParams {
  search?: string;
  network?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
  status?: AvailabilityStatus;

  // BBox (map bounds) filtering
  minLat?: number;
  minLon?: number;
  maxLat?: number;
  maxLon?: number;

  // Optional pagination
  offset?: number;
  limit?: number;
}

export interface MapBBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
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

export function mapBackendToFront(station: BackendStation): Station {
  const availability_status = mapBackendStatusToAvailability(station.status);
  const maxKw = station.maxPowerKw ?? null;
  const connector_types = station.connectorTypes.filter(
    (c): c is ConnectorType => c !== 'Other',
  );

  return {
    id: station.id,
    name: station.name,
    operator: station.network || 'Unknown operator',
    address: station.address,
    district: parseDistrictFromAddress(station.address),
    latitude: station.latitude,
    longitude: station.longitude,
    connector_types,
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

export function buildStationsQueryParams(
  filters: Filters,
  searchQuery: string,
): StationsQueryParams {
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

  // Intentionally no map bbox: in Telegram/WebView the first bounds can be wrong
  // before layout/size settle, which made the API return zero stations.

  return params;
}

export interface StationsPage {
  items: Station[];
  total: number;
}

export async function fetchStationsFromApi(
  params: StationsQueryParams,
): Promise<StationsPage> {
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
  if (typeof params.minLat === 'number') url.searchParams.set('minLat', String(params.minLat));
  if (typeof params.minLon === 'number') url.searchParams.set('minLon', String(params.minLon));
  if (typeof params.maxLat === 'number') url.searchParams.set('maxLat', String(params.maxLat));
  if (typeof params.maxLon === 'number') url.searchParams.set('maxLon', String(params.maxLon));
  if (typeof params.offset === 'number') url.searchParams.set('offset', String(params.offset));
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));

  let data: BackendStationsPage;
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
  return { items: data.items.map(mapBackendToFront), total: data.total };
}

