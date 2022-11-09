import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource ,Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { BalanceType } from '../../common/enums/balanceType.enum';
import { CreateBalanceTransactionDto } from './dto/create-balance-transaction.dto';
import { UpdateBalanceDto } from '../balance/dto/update-balance.dto';
import { BalanceTransaction } from './entities/balance-transaction.entity';
import { Balance } from '../balance/entities/balance.entity';
import { CreateBulkVacationTransactionDto } from './dto/create-bulk-vacation-transaction.dto';
import { CustomRpcException } from 'src/common/exception/custom-rpc.exception';

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

  async createBulkVacation(createBulkVacationTransactionDto: CreateBulkVacationTransactionDto) {
    const userIds = createBulkVacationTransactionDto.userIds;
    const typeId = createBulkVacationTransactionDto.typeId;
    const operation = createBulkVacationTransactionDto.operation;
    const amount = createBulkVacationTransactionDto.amount;
    const updatedBy = createBulkVacationTransactionDto.updatedBy;

   if (userIds.length === 0) {
    throw new CustomRpcException('UserIds not defined'
    , HttpStatus.NOT_FOUND, 'Not Found');
   }
    
    const balances =  await this.balanceService.findAll(null, userIds);

    if (balances.length === 0) {
      throw new CustomRpcException('Balances not found'
      , HttpStatus.NOT_FOUND, 'Not Found');
     }

    const balanceIds: any = [];
    balances.map((balance: Balance) => balanceIds.push(balance.id));
    
    const vacationtransactions = await Promise.all(
      balanceIds.map( async(balanceId: number) => {
        const createBalanceTransactionDto = {
          balanceId,
          typeId,
          operation,
          amount,
          updatedBy
        } as CreateBalanceTransactionDto;

        const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
          balanceId,
          operation,
          amount
        ) as UpdateBalanceDto;

        await this.transactionCreateBalanceTransaction(
          balanceId,
          createBalanceTransactionDto,
          updateBalanceDto
        );
      })
    );

    return vacationtransactions;
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

  update(id: number) {
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
