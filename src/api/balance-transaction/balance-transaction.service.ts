import { Injectable } from '@nestjs/common';
import { CreateBalanceTransactionDto } from './dto/create-balance-transaction.dto';
import { UpdateBalanceTransactionDto } from './dto/update-balance-transaction.dto';

@Injectable()
export class BalanceTransactionService {
  create(createBalanceTransactionDto: CreateBalanceTransactionDto) {
    return 'This action adds a new balanceTransaction';
  }

  findAll() {
    return `This action returns all balanceTransaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} balanceTransaction`;
  }

  update(id: number, updateBalanceTransactionDto: UpdateBalanceTransactionDto) {
    return `This action updates a #${id} balanceTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} balanceTransaction`;
  }
}
