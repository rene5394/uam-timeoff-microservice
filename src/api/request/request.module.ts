import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from './entities/request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestDayModule } from '../request-day/request-day.module';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), BalanceModule, RequestDayModule],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService]
})
export class RequestModule {}
