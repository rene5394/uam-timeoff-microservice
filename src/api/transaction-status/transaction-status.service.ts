import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionStatusDto } from './dto/create-transaction-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionStatus } from './entities/transaction-status.entity';

@Injectable()
export class TransactionStatusService {
  constructor(
    @InjectRepository(TransactionStatus)
    private readonly transactionStatusRepository: Repository<TransactionStatus>
  ) {}

  async findAll(): Promise<TransactionStatus[]> {
    return await this.transactionStatusRepository.find();
  }

  async findOne(id: number): Promise<TransactionStatus> {
    return await this.transactionStatusRepository.findOne({ where: { id } });
  }
}
