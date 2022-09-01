import { Module } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatus } from './entities/transaction-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionStatus])],
  controllers: [TransactionStatusController],
  providers: [TransactionStatusService]
})
export class TransactionStatusModule {}
