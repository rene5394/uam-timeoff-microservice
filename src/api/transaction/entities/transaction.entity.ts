import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Request } from "src/api/request/entities/request.entity";

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

    @ManyToOne(() => Request, (request) => request.id)
    @JoinColumn({name: 'requestId'})
    request: Request;
}