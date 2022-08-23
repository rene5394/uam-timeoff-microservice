import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryColumn({ type: 'smallint', nullable: false })
  id: number;

  @Column({ type: 'smallint', nullable: false })
  userId: number

  @Column({ type: 'tinyint', nullable: false })
  compDays: number
  
  @Column({ type: 'tinyint', nullable: false })
  vacationDays: number
}
