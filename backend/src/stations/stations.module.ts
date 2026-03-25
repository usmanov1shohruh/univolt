import { Module } from '@nestjs/common';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from './entities/station.entity';

const dbEnabled = Boolean(process.env.DB_HOST && process.env.DB_DATABASE);

@Module({
  imports: dbEnabled ? [TypeOrmModule.forFeature([StationEntity])] : [],
  providers: [StationsService],
  controllers: [StationsController],
})
export class StationsModule {}
