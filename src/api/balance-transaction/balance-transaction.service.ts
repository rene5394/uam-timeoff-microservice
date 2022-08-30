import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource ,Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { BalanceType } from '../../common/enums/balanceType.enum';
import { CreateBalanceTransactionDto } from './dto/create-balance-transaction.dto';
import { UpdateBalanceTransactionDto } from './dto/update-balance-transaction.dto';
import { UpdateBalanceDto } from '../balance/dto/update-balance.dto';
import { BalanceTransaction } from './entities/balance-transaction.entity';
import { Balance } from '../balance/entities/balance.entity';

@Injectable()
export class BalanceTransactionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BalanceTransaction)
    private readonly balanceTransactionRepository: Repository<BalanceTransaction>,
    private readonly balanceService: BalanceService
  ) {}

  async create(createBalanceTransactionDto: CreateBalanceTransactionDto): Promise<BalanceTransaction> {
    const { balanceId, typeId, operation} = createBalanceTransactionDto;

    let balanceTransaction: any;

    if (typeId === BalanceType.compDays) {
      const compDays = createBalanceTransactionDto.amount;

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balanceId,
        operation,
        compDays
      );

      balanceTransaction = await this.transactionCreateBalanceTransaction(
        balanceId,
        createBalanceTransactionDto,
        updateBalanceDto
      );
    }

    if (typeId === BalanceType.vacations) {
      const vacations = createBalanceTransactionDto.amount;

      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balanceId,
        operation,
        vacations
      );

      balanceTransaction = await this.transactionCreateBalanceTransaction(
        balanceId,
        createBalanceTransactionDto,
        updateBalanceDto
      );
    }
    
    if (balanceTransaction.error) {
      throw new BadRequestException(balanceTransaction.error);
    }
    
    return balanceTransaction;
  }

  async findAll(): Promise<BalanceTransaction[]> {
    return await this.balanceTransactionRepository.find();
  }

  async findAllByUser(userId: number): Promise<BalanceTransaction[]> {
    const { id: balanceId } = await this.balanceService.findOneByUserId(userId);
    return await this.balanceTransactionRepository.find({ where: { balanceId } });
  }

  async findOne(id: number): Promise<BalanceTransaction> {
    return await this.balanceTransactionRepository.findOne({ where: { id: id } });
  }

  update(id: number, updateBalanceTransactionDto: UpdateBalanceTransactionDto) {
    return `This action updates a #${id} balanceTransaction`;
  }

  async transactionCreateBalanceTransaction(
    balanceId: number,
    createBalanceTransactionDto: CreateBalanceTransactionDto,
    updateBalanceDto: UpdateBalanceDto
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await queryRunner.manager.update(
        Balance,
        balanceId,
        updateBalanceDto
      );

      const balanceTransaction = await queryRunner.manager.save(
        BalanceTransaction, 
        createBalanceTransactionDto
      );
      
      queryRunner.commitTransaction();

      return balanceTransaction;
    } catch(err) {
      await queryRunner.rollbackTransaction();

      return { 
        error: err
      };
    }
  }
}
