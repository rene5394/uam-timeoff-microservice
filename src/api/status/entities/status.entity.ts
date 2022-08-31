import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryColumn({ type: 'tinyint', nullable: false })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;
  
  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
