import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('requestDays')
export class RequestDay {
    @PrimaryColumn({ type: 'bigint', nullable: false})
    id: number;
  
    @Column({ type: 'bigint', nullable: false })
    requestId: number;

    @Column({ type: 'datetime', nullable: false })
    day: Date;

    @Column({ type: 'tinyint', nullable: false })
    admin: number;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;
}