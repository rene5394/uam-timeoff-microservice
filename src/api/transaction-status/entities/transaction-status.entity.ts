import {  Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('transaction-statuses')
export class TransactionStatus {
    @PrimaryColumn({ type: 'tinyint', nullable: false })
    id: number;

    @Column({ type: 'varchar', nullable: false })
    name: number;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;
}
