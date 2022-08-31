import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>
  ) {}

  async findAll(): Promise<Status[]> {
    return await this.statusRepository.find();
  }

  async findOne(id: number): Promise<Status> {
    return await this.statusRepository.findOne({ where: { id: id } });
  }
}
