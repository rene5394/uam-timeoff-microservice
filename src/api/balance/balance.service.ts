import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginationLimit } from 'src/common/constants';
import { DataSource, Repository } from 'typeorm';
import { BalanceOperation } from '../../common/enums/balanceOperation.enum';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { Balance } from './entities/balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>
  ) {}

  async create(createBalanceDto: CreateBalanceDto): Promise<Balance> {
    return await this.balanceRepository.save(createBalanceDto);
  }

  async findAll(page: number, userIds: any[]): Promise<Balance[]> {
    const query = this.dataSource.getRepository(Balance)
    .createQueryBuilder("balances");

    if (userIds) {
      query.where("balances.userId IN (:userIds)", { userIds });
    }

    if (page) {
      query
        .skip((page -1) * paginationLimit.balances)
        .take(paginationLimit.balances);
    }
    
    return await query.getMany();
  }

  async findOne(id: number): Promise<Balance> {
    return await this.balanceRepository.findOne({ where: { id: id } });
  }

  async findOneByUserId(userId: number): Promise<Balance> {
    return await this.balanceRepository.findOne({ where: { userId: userId } });
  }

  async update(id: number, updateBalanceDto: UpdateBalanceDto) {
    return await this.balanceRepository.update(id, updateBalanceDto);
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

    return { compDays: totalCompDays, vacationDays: balance.vacationDays };
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
