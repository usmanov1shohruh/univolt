import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  StationFilters,
  StationsService,
} from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  getStations(
    @Query('search') search?: string,
    @Query('network') network?: string,
    @Query('connectorType') connectorType?: string,
    @Query('minPowerKw') minPowerKw?: string,
    @Query('status') status?: string,
  ) {
    const filters: StationFilters = {
      search,
      network,
      connectorType: connectorType as any,
      minPowerKw: minPowerKw ? Number(minPowerKw) : undefined,
      status: status as any,
    };
    return this.stationsService.findAll(filters);
  }

  @Get('filters/meta')
  getFiltersMeta() {
    return {
      networks: this.stationsService.listNetworks(),
      connectorTypes: this.stationsService.listConnectorTypes(),
      statuses: this.stationsService.listStatuses(),
    };
  }

  @Get(':id')
  getStation(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }
}
