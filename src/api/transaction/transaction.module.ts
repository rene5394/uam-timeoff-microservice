import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestModule } from '../request/request.module';
import { RequestDayModule } from '../request-day/request-day.module';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), BalanceModule, RequestModule, RequestDayModule],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule {}
