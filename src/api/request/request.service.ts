import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    return await this.requestRepository.save(createRequestDto);
  }

  async findAll(): Promise<Request[]> {
   return await this.requestRepository.find();
  }

  async findAllByUserId(userId: number): Promise<Request[]> {
    return await this.requestRepository.find({ where: { userId }});
  }

  async findOne(id: number): Promise<Request> {
    return await this.requestRepository.findOne({ where: { id }});
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }
}
