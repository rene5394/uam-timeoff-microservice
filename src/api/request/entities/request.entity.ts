import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('requests')
export class Request {
    @PrimaryColumn({ type: 'bigint', nullable: false})
    id: number;
  
    @Column({ type: 'smallint', nullable: false })
    userId: number;

    @Column({ type: 'smallint', nullable: false })
    createdBy: number;

    @Column({ type: 'tinyint', nullable: false })
    typeId: number;

    @Column({ type: 'tinyint', nullable: false })
    statusId: number;

    @Column({ type: 'datetime', nullable: false })
    startDate: Date;

    @Column({ type: 'datetime', nullable: false })
    endDate: Date;

    @Column({ type: 'tinyint', nullable: false })
    coachApproval: number;

    @Column({ type: 'tinyint', nullable: false })
    hrApproval: number;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;
}