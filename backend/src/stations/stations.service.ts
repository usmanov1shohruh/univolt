import { Injectable, NotFoundException } from '@nestjs/common';

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2' | 'GB/T' | 'Other';

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

@Injectable()
export class StationsService {
  // In-memory mock data for Stage 1 MVP
  private readonly stations: Station[] = [
    {
      id: 'uz-001',
      name: 'Univolt Tashkent Downtown',
      address: 'Ташкент, проспект Амира Темура, 10',
      latitude: 41.3111,
      longitude: 69.2797,
      network: 'Univolt',
      connectorTypes: ['CCS2', 'Type2'],
      maxPowerKw: 120,
      portsCount: 4,
      status: 'available',
      openingHours: '24/7',
    },
    {
      id: 'uz-002',
      name: 'GreenCharge Mega Mall',
      address: 'Ташкент, улица Буюк Ипак Йули, 45',
      latitude: 41.3382,
      longitude: 69.3344,
      network: 'GreenCharge',
      connectorTypes: ['CCS2'],
      maxPowerKw: 60,
      portsCount: 2,
      status: 'busy',
      openingHours: '08:00–23:00',
    },
    {
      id: 'uz-003',
      name: 'CityCharge Old Town',
      address: 'Ташкент, улица Бухара, 7',
      latitude: 41.3205,
      longitude: 69.2442,
      network: 'CityCharge',
      connectorTypes: ['Type2'],
      maxPowerKw: 22,
      portsCount: 3,
      status: 'offline',
      openingHours: null,
    },
  ];

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
