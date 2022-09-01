import { Injectable } from '@nestjs/common';
import { CreateTransactionStatusDto } from './dto/create-transaction-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionStatusService {
  create(createTransactionStatusDto: CreateTransactionStatusDto) {
    return 'This action adds a new transactionStatus';
  }

  findAll() {
    return `This action returns all transactionStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionStatus`;
  }

  update(id: number, updateTransactionStatusDto: UpdateTransactionStatusDto) {
    return `This action updates a #${id} transactionStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionStatus`;
  }
}
