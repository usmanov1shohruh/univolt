import { Controller, Get, Param, Query } from '@nestjs/common';
import { StationFilters, StationsService } from './stations.service';
import { GetStationsQueryDto } from './dto/get-stations-query.dto';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  getStations(@Query() query: GetStationsQueryDto) {
    const filters: StationFilters = {
      search: query.search,
      network: query.network,
      connectorType: query.connectorType,
      minPowerKw: query.minPowerKw,
      status: query.status,
      minLat: query.minLat,
      minLon: query.minLon,
      maxLat: query.maxLat,
      maxLon: query.maxLon,
      offset: query.offset,
      limit: query.limit,
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
