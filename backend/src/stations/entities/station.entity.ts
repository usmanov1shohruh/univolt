import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stations' })
export class StationEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

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

  @Column({ type: 'integer', nullable: true })
  maxPowerKw!: number | null;

  @Column({ type: 'integer', nullable: true })
  portsCount!: number | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  openingHours!: string | null;
}
