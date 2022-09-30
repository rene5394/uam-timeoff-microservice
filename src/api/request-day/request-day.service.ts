import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRequestDayDto } from './dto/create-request-day.dto';
import { RequestDay } from './entities/request-day.entity';
import { Request } from '../request/entities/request.entity';

@Injectable()
export class RequestDayService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RequestDay)
    private readonly requestDayRepository: Repository<RequestDay>
  ) {}

  async create(createRequestDayDto: CreateRequestDayDto): Promise<RequestDay> {
    return await this.requestDayRepository.save(createRequestDayDto);
  }

  async findByDay(day: Date): Promise<RequestDay[]> {
    return await this.requestDayRepository.find({ where: { day } });
  }

  async findByDays(dates: Date[]): Promise<RequestDay[]> {
    let requests = [];

    const requestsByDays = await Promise.all(
      dates.map( async(date: Date) => {
        const day = new Date(date);
        
        return this.dataSource.getRepository(RequestDay)
          .createQueryBuilder("requestDays")
          .select("requestDays.*, userId")
          .innerJoin(Request, "requests", "requests.id = requestDays.requestId")
          .where("requestDays.day = :day", { day })
          .getRawMany();
      })
    )

    requestsByDays.map((requestsByDay) => {
      requests.push(requestsByDay);
    });    
    
    return requests;
  }

  async countByRequestId(requestId: number): Promise<number> {
    return await this.requestDayRepository.count({ where: { requestId } });
  }

  async countByDay(day: Date): Promise<number> {
    return await this.requestDayRepository.count({ where: { day } });
  }

  async countByDays(dates: Date[]): Promise<number[]> {
    let numberOfRequest = [];
    
    const numbers = await Promise.all(
      dates.map( async(date: Date) => {
        const day = new Date(date);

        return await this.requestDayRepository.count({ where: { day } });
      })
    )

    numbers.map((number) => {
      numberOfRequest.push(number);
    });
    
    return numberOfRequest;
  }

  async countByDaysNoAdmin(dates: Date[]): Promise<number[]> {
    let numberOfRequest = [];

    const numbers = await Promise.all(
      dates.map( async(date: Date) => {
        const day = new Date(date);

        return await this.requestDayRepository.count({ where: { day, admin: 0 } });
      })
    )

    numbers.map((number) => {
      numberOfRequest.push(number);
    });
    
    return numberOfRequest;
  }

  async delete(id: number) {
    return await this.requestDayRepository.delete({ requestId: id });
  }
}