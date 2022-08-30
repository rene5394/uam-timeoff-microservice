import { Module } from '@nestjs/common';
import { BalanceTransactionService } from './balance-transaction.service';
import { BalanceTransactionController } from './balance-transaction.controller';
import { BalanceTransaction } from './entities/balance-transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceTransaction]), BalanceModule],
  controllers: [BalanceTransactionController],
  providers: [BalanceTransactionService],
  exports: [BalanceTransactionService]
})
export class BalanceTransactionModule {}
