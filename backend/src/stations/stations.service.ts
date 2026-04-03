import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { StationEntity } from './entities/station.entity';

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2' | 'GB/T' | 'Other';

/**
 * Station availability for the API (live occupancy / session state).
 * Parsed catalog rows do not contain this signal — imported stations use `unknown`.
 * The source TSV "status" column is operational hours and is mapped to `openingHours`, not here.
 */
export type StationStatus =
  | 'available'
  | 'busy'
  | 'offline'
  | 'unknown'
  | 'maintenance';

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  network: string;
  connectorTypes: ConnectorType[];
  maxPowerKw: number | null;
  portsCount: number | null;
  status: StationStatus;
  openingHours: string | null;
  /**
   * Optional metadata for stations coming from external providers (e.g. Tokbor).
   */
  source?: string;
  sourceStationId?: string | null;
  isDiscounted?: boolean;
  hasTaxiDiscount?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
  iconBottom?: boolean | null;
}

export interface StationFilters {
  search?: string;
  network?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
  status?: StationStatus;
  // Map bounds filtering (Leaflet bbox)
  minLat?: number;
  minLon?: number;
  maxLat?: number;
  maxLon?: number;

  // Optional pagination helpers
  offset?: number;
  limit?: number;
}

export interface StationsPage {
  items: Station[];
  total: number;
}

function loadSeedStations(): Station[] {
  // File lives next to this module in src/ and is copied to dist/stations/ (see nest-cli assets).
  // Avoid reading backend/data at runtime — that path is missing on Vercel/serverless bundles.
  const seedPath = path.join(__dirname, 'stations.seed.json');
  const raw = fs.readFileSync(seedPath, 'utf8');
  return JSON.parse(raw) as Station[];
}

@Injectable()
export class StationsService implements OnModuleInit {
  private readonly stations: Station[] = loadSeedStations();

  constructor(
    @Optional()
    @InjectRepository(StationEntity)
    private readonly stationsRepo?: Repository<StationEntity>,
  ) {}

  async onModuleInit() {
    if (!this.stationsRepo) return;
    const count = await this.stationsRepo.count();
    if (count === 0) {
      // Seed DB from the existing ETL output file.
      await this.stationsRepo.save(this.stations);
    }
  }

  async findAll(filters: StationFilters = {}): Promise<StationsPage> {
    const {
      search,
      network,
      connectorType,
      minPowerKw,
      status,
      minLat,
      minLon,
      maxLat,
      maxLon,
      offset,
      limit,
    } = filters;

    // DB-backed path (when Postgres is configured)
    if (this.stationsRepo) {
      const qb = this.stationsRepo.createQueryBuilder('station');

      if (search) {
        const s = search.toLowerCase();
        qb.andWhere(
          '(LOWER(station.name) LIKE :q OR LOWER(station.address) LIKE :q)',
          { q: `%${s}%` },
        );
      }

      if (network) {
        qb.andWhere('station.network = :network', { network });
      }

      if (connectorType) {
        qb.andWhere(':connectorType = ANY(station.connectorTypes)', {
          connectorType,
        });
      }

      if (typeof minPowerKw === 'number') {
        qb.andWhere(
          '(station.maxPowerKw IS NULL OR station.maxPowerKw >= :minPowerKw)',
          {
            minPowerKw,
          },
        );
      }

      if (status) {
        qb.andWhere('station.status = :status', { status });
      }

      const hasBbox =
        typeof minLat === 'number' &&
        typeof minLon === 'number' &&
        typeof maxLat === 'number' &&
        typeof maxLon === 'number';

      if (hasBbox) {
        qb.andWhere('station.latitude BETWEEN :minLat AND :maxLat', {
          minLat,
          maxLat,
        });
        qb.andWhere('station.longitude BETWEEN :minLon AND :maxLon', {
          minLon,
          maxLon,
        });
      }

      const total = await qb.getCount();

      const safeOffset = typeof offset === 'number' && offset > 0 ? offset : 0;
      const safeLimit =
        typeof limit === 'number' && limit > 0 ? limit : undefined;

      if (safeOffset) qb.offset(safeOffset);
      if (safeLimit) qb.limit(safeLimit);

      const rows = await qb.getMany();

      const items: Station[] = rows.map((row) => ({
        id: row.id,
        source: row.source,
        sourceStationId: row.sourceStationId,
        name: row.name,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        network: row.network,
        connectorTypes: (row.connectorTypes ?? []) as ConnectorType[],
        maxPowerKw: row.maxPowerKw,
        portsCount: row.portsCount,
        status: row.status as StationStatus,
        openingHours: row.openingHours,
        isDiscounted: row.isDiscounted,
        hasTaxiDiscount: row.hasTaxiDiscount,
        iconLeft: row.iconLeft,
        iconRight: row.iconRight,
        iconBottom: row.iconBottom,
      }));

      return { items, total };
    }

    // Fallback in-memory path (serverless / no DB configured)
    const filtered = this.stations.filter((station) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !station.name.toLowerCase().includes(s) &&
          !station.address.toLowerCase().includes(s)
        ) {
          return false;
        }
      }

      if (network && station.network !== network) {
        return false;
      }

      if (
        connectorType &&
        !station.connectorTypes
          .map((c) => c.toLowerCase())
          .includes(connectorType.toLowerCase() as ConnectorType)
      ) {
        return false;
      }

      if (
        typeof minPowerKw === 'number' &&
        station.maxPowerKw !== null &&
        station.maxPowerKw < minPowerKw
      ) {
        return false;
      }

      if (status && station.status !== status) {
        return false;
      }

      const hasBbox =
        typeof minLat === 'number' &&
        typeof minLon === 'number' &&
        typeof maxLat === 'number' &&
        typeof maxLon === 'number';

      if (hasBbox) {
        if (station.latitude < minLat || station.latitude > maxLat)
          return false;
        if (station.longitude < minLon || station.longitude > maxLon)
          return false;
      }

      return true;
    });

    const total = filtered.length;
    const safeOffset = typeof offset === 'number' && offset > 0 ? offset : 0;
    const safeLimit =
      typeof limit === 'number' && limit > 0 ? limit : undefined;

    const items = safeLimit
      ? filtered.slice(safeOffset, safeOffset + safeLimit)
      : filtered.slice(safeOffset);

    return { items, total };
  }

  async findOne(id: string): Promise<Station> {
    if (this.stationsRepo) {
      const row = await this.stationsRepo.findOne({ where: { id } });
      if (!row) {
        throw new NotFoundException(`Station with id ${id} not found`);
      }
      return {
        id: row.id,
        source: row.source,
        sourceStationId: row.sourceStationId,
        name: row.name,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        network: row.network,
        connectorTypes: row.connectorTypes as ConnectorType[],
        maxPowerKw: row.maxPowerKw,
        portsCount: row.portsCount,
        status: row.status as StationStatus,
        openingHours: row.openingHours,
        isDiscounted: row.isDiscounted,
        hasTaxiDiscount: row.hasTaxiDiscount,
        iconLeft: row.iconLeft,
        iconRight: row.iconRight,
        iconBottom: row.iconBottom,
      };
    }

    const station = this.stations.find((s) => s.id === id);
    if (!station) {
      throw new NotFoundException(`Station with id ${id} not found`);
    }
    return station;
  }

  listNetworks(): string[] {
    return Array.from(new Set(this.stations.map((s) => s.network))).sort();
  }

  listConnectorTypes(): ConnectorType[] {
    return Array.from(
      new Set(this.stations.flatMap((s) => s.connectorTypes)),
    ).sort();
  }

  listStatuses(): StationStatus[] {
    return Array.from(new Set(this.stations.map((s) => s.status))).sort();
  }
}
