import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDayDto } from './dto/create-request-day.dto';
import { RequestDay } from './entities/request-day.entity';

@Injectable()
export class RequestDayService {
  constructor(
    @InjectRepository(RequestDay)
    private readonly requestDayRepository: Repository<RequestDay>
  ) {}

  async create(createRequestDayDto: CreateRequestDayDto): Promise<RequestDay> {
    return await this.requestDayRepository.save(createRequestDayDto);
  }

  async countByRequestId(requestId: number): Promise<number> {
    return await this.requestDayRepository.count({ where: { requestId } });
  }

  async countByDay(day: Date): Promise<number> {
    return await this.requestDayRepository.count({ where: { day } });
  }

  async countByDays(dates: Date[]): Promise<number[]> {
    let numberOfRequest = [];

    await Promise.all(
      dates.map( async(date: Date) => {
        const day = new Date(date);
  
        let number = await this.requestDayRepository.count({ where: { day } });
  
        numberOfRequest.push(number);
      })
    );

    return numberOfRequest;
  }

  async countByDaysNoAdmin(dates: Date[]): Promise<number[]> {
    let numberOfRequest = [];

    await Promise.all(
      dates.map( async(date: Date) => {
        const day = new Date(date);
  
        let number = await this.requestDayRepository.count({ where: { day, admin: 0 } });
  
        numberOfRequest.push(number);
      })
    );

    return numberOfRequest;
  }

  async delete(id: number) {
    return await this.requestDayRepository.delete({ requestId: id });
  }
}