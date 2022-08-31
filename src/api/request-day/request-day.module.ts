import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestDay } from './entities/request-day.entity';
import { RequestDayService } from './request-day.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestDay])],
  providers: [RequestDayService],
  exports: [RequestDayService]
})
export class RequestDayModule {}
