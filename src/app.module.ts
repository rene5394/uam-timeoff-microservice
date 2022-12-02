import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BalanceModule } from './api/balance/balance.module';
import { BalanceTransactionModule } from './api/balance-transaction/balance-transaction.module';
import { DataSource } from 'typeorm';
import { StatusModule } from './api/status/status.module';
import { TypeModule } from './api/type/type.module';
import { RequestModule } from './api/request/request.module';
import { RequestDayModule } from './api/request-day/request-day.module';
import { TransactionModule } from './api/transaction/transaction.module';
import { TransactionStatusModule } from './api/transaction-status/transaction-status.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any || 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 3306,
      username  : process.env.DATABASE_USERNAME || 'root',
      password  : process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE || 'timeoff',
      entities: [],
      autoLoadEntities: true,
      synchronize: false,
      extra : {
        connectionLimit: 100
      }
    }),
    ScheduleModule.forRoot(),
    BalanceModule,
    BalanceTransactionModule,
    StatusModule,
    RequestModule,
    RequestDayModule,
    TypeModule,
    TransactionModule,
    TransactionStatusModule
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
