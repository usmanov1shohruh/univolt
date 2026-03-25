import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2' | 'GB/T' | 'Other';

/**
 * Station availability for the API (live occupancy / session state).
 * Parsed catalog rows do not contain this signal — imported stations use `unknown`.
 * The source TSV "status" column is operational hours and is mapped to `openingHours`, not here.
 */
export type StationStatus = 'available' | 'busy' | 'offline' | 'unknown';

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
}

export interface StationFilters {
  search?: string;
  network?: string;
  connectorType?: ConnectorType;
  minPowerKw?: number;
  status?: StationStatus;
}

function loadSeedStations(): Station[] {
  // File lives next to this module in src/ and is copied to dist/stations/ (see nest-cli assets).
  // Avoid reading backend/data at runtime — that path is missing on Vercel/serverless bundles.
  const seedPath = path.join(__dirname, 'stations.seed.json');
  const raw = fs.readFileSync(seedPath, 'utf8');
  return JSON.parse(raw) as Station[];
}

@Injectable()
export class StationsService {
  private readonly stations: Station[] = loadSeedStations();

  findAll(filters: StationFilters = {}): Station[] {
    const { search, network, connectorType, minPowerKw, status } = filters;

    return this.stations.filter((station) => {
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
        !station.connectorTypes.map((c) => c.toLowerCase()).includes(connectorType.toLowerCase() as ConnectorType)
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

      return true;
    });
  }

  findOne(id: string): Station {
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
    return Array.from(new Set(this.stations.map((s) => s.status))).sort() as StationStatus[];
  }
}
