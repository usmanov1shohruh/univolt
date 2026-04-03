import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { ConnectorType, StationStatus } from '../stations.service';

const connectorTypeValues: readonly ConnectorType[] = [
  'CCS2',
  'CHAdeMO',
  'Type2',
  'GB/T',
  'Other',
];
const stationStatusValues: readonly StationStatus[] = [
  'available',
  'busy',
  'offline',
  'unknown',
  'maintenance',
];

export class GetStationsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  network?: string;

  @IsOptional()
  @IsIn(connectorTypeValues)
  connectorType?: ConnectorType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPowerKw?: number;

  @IsOptional()
  @IsIn(stationStatusValues)
  status?: StationStatus;

  // BBox (map bounds) filtering: only stations within current visible area.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLon?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLon?: number;

  // Optional pagination helpers for future UX.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
