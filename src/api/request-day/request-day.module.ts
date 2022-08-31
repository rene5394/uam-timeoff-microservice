import { Module } from '@nestjs/common';
import { RequestDayService } from './request-day.service';

@Module({
  providers: [RequestDayService],
  exports: [RequestDayService]
})
export class RequestDayModule {}
