import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('transactions')
export class Transaction {
    @PrimaryColumn({ type: 'bigint', nullable: false})
    id: number;
  
    @Column({ type: 'bigint', nullable: false })
    requestId: number;

    @Column({ type: 'tinyint', nullable: false })
    transactionStatusId: number;

    @Column({ type: 'smallint', nullable: false })
    createdBy: number;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;
}