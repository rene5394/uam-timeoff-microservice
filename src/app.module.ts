import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceModule } from './api/balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any || 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 3306,
      username  : process.env.DATABASE_USERNAME || 'root',
      password  : process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE || 'timeoff',
      entities: [],
      autoLoadEntities: true,
      synchronize: false
    }),
    BalanceModule
  ],
})
export class AppModule {}
