import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceOperation } from '../../common/enums/balanceOperation.enum';
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

  async findOneByUserId(userId: number): Promise<Balance> {
    return await this.balanceRepository.findOne({ where: { userId: userId } });
  }

  update(id: number, updateBalanceDto: UpdateBalanceDto) {
    return `This action updates a #${id} balance`;
  }

  remove(id: number) {
    return `This action removes a #${id} balance`;
  }

  async validateCompDaysUpdate(id: number, operation:number, compDays: number): Promise<any> {
    const balance  = await this.findOne(id);
    let totalCompDays: number;

    if (operation === BalanceOperation.addition) {
      totalCompDays = balance.compDays + compDays;
    }
    
    if (operation === BalanceOperation.substraction) {
      if (compDays > balance.compDays) {
        return {
          error: 'Amount of comp days must not be more of available comp days'
        };
      }

      totalCompDays = balance.compDays - compDays;
    }

    return { comDays: totalCompDays, vacationDays: balance.vacationDays };
  }

  async validateVacationsUpdate(id: number, operation: number, vacationDays: number): Promise<any> {
    const balance = await this.findOne(id);
    let totalVacationDays: number;

    if (operation === BalanceOperation.addition) {
      totalVacationDays = balance.vacationDays + vacationDays;
    }
    
    if (operation === BalanceOperation.substraction) {
      if (vacationDays > balance.vacationDays) {
        return {
          error: 'Amount of vacations must not be greater then available vacations'
        };
      }

      totalVacationDays = balance.vacationDays - vacationDays;
    }

    return { compDays: balance.compDays, vacationDays: totalVacationDays };
  }
}
