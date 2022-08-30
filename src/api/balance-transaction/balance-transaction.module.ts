import { Module } from '@nestjs/common';
import { BalanceTransactionService } from './balance-transaction.service';
import { BalanceTransactionController } from './balance-transaction.controller';

@Module({
  controllers: [BalanceTransactionController],
  providers: [BalanceTransactionService]
})
export class BalanceTransactionModule {}
