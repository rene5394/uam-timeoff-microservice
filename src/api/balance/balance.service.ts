import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { Balance } from './entities/balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>
  ) {}

  async create(createBalanceDto: CreateBalanceDto): Promise<Balance> {
    return await this.balanceRepository.save(createBalanceDto);
  }

  async findAll(): Promise<Balance[]> {
    return await this.balanceRepository.find();
  }

  async findOne(id: number): Promise<Balance> {
    return await this.balanceRepository.findOne({ where: { id: id } });
  }

  update(id: number, updateBalanceDto: UpdateBalanceDto) {
    return `This action updates a #${id} balance`;
  }

  remove(id: number) {
    return `This action removes a #${id} balance`;
  }
}
