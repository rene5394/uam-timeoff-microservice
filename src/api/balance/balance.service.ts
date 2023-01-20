import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginationLimit } from 'src/common/constants';
import { RequestType } from 'src/common/enums/requestType.enum';
import { CustomRpcException } from 'src/common/exception/custom-rpc.exception';
import { DataSource, Repository } from 'typeorm';
import { BalanceOperation } from '../../common/enums/balanceOperation.enum';
import { BalanceTransaction } from '../balance-transaction/entities/balance-transaction.entity';
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
    try {
      const balance = await this.balanceRepository.save(createBalanceDto);

      return balance;
    } catch (error) {
      throw new CustomRpcException('Error executing create balance'
      , HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
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

  async update(id: number, updatedBy: number, updateBalanceDto: UpdateBalanceDto) {    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balance = await this.balanceRepository.findOne({ where: { id: id } });
      await queryRunner.manager.update(Balance, id, {
        compDays: updateBalanceDto.compDays,
        vacationDays: updateBalanceDto.vacationDays
      });
      await queryRunner.commitTransaction();

      if (balance.compDays !== updateBalanceDto.compDays) {
        const operation =  (updateBalanceDto.compDays > balance.compDays) ?
          BalanceOperation.addition :
          BalanceOperation.substraction;

        await queryRunner.manager.insert(BalanceTransaction, {
          balanceId: id,
          typeId: RequestType.compDay,
          operation,
          amount: Math.abs(updateBalanceDto.compDays - balance.compDays),
          comment: updateBalanceDto.comment,
          updatedBy
        });
      } if (balance.vacationDays !== updateBalanceDto.vacationDays) {
        const operation =  (updateBalanceDto.vacationDays > balance.vacationDays) ?
          BalanceOperation.addition :
          BalanceOperation.substraction;
        
        await queryRunner.manager.insert(BalanceTransaction, {
          balanceId: id,
          typeId: RequestType.vacation,
          operation,
          amount: Math.abs(updateBalanceDto.vacationDays - balance.vacationDays),
          comment: updateBalanceDto.comment,
          updatedBy
        });
      }

      return id;
    } catch (error) {
      console.log('err', error);
      
      await queryRunner.rollbackTransaction();

      throw new CustomRpcException('Error executing update balance'
      , HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
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
