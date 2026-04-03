import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stations' })
export class StationEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 32, default: 'catalog' })
  source!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sourceStationId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ type: 'varchar', length: 128 })
  network!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  connectorTypes!: string[];

  @Column({ type: 'boolean', default: false })
  isDiscounted!: boolean;

  @Column({ type: 'boolean', default: false })
  hasTaxiDiscount!: boolean;

  @Column({ type: 'boolean', default: false })
  iconLeft!: boolean;

  @Column({ type: 'boolean', default: false })
  iconRight!: boolean;

  @Column({ type: 'boolean', nullable: true })
  iconBottom!: boolean | null;

  @Column({ type: 'integer', nullable: true })
  maxPowerKw!: number | null;

  @Column({ type: 'integer', nullable: true })
  portsCount!: number | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  openingHours!: string | null;
}
