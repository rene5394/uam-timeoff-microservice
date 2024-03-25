import { HttpStatus, Inject, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Role } from '../../common/enums/role.enum';
import { TransactionStatus } from 'src/common/enums/transactionStatus.enum';
import { Transaction } from './entities/transaction.entity';
import { Hr } from '../../common/enums/hr.enum';
import { UpdateRequestDto } from '../request/dto/update-request.dto';
import { RequestStatus } from '../../common/enums/requestStatus.enum';
import { RequestService } from '../request/request.service';
import { Request } from '../request/entities/request.entity';
import { RequestDayService } from '../request-day/request-day.service';
import { Balance } from '../balance/entities/balance.entity';
import { BalanceService } from '../balance/balance.service';
import { RequestType } from '../../common/enums/requestType.enum';
import { BalanceOperation } from '../../common/enums/balanceOperation.enum';
import { UpdateBalanceDto } from '../balance/dto/update-balance.dto';
import { ApproveStatus } from '../../common/enums/approveStatus.enum';
import { CustomRpcException } from 'src/common/exception/custom-rpc.exception';
import { RequestDay } from '../request-day/entities/request-day.entity';
import { BalanceTransaction } from '../balance-transaction/entities/balance-transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(BalanceService)
    private readonly balanceService: BalanceService,
    @Inject(RequestService)
    private readonly requestService: RequestService,
    @Inject(RequestDayService)
    private readonly requestDayService: RequestDayService
  ) {}

  async create(roleId: number, hr: number, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { requestId, transactionStatusId } = createTransactionDto;
    const request = await this.requestService.findOne(requestId);
    const { updateRequestDTO, returnBalance } = await this.validateCreate(
      hr,
      roleId,
      request,
      transactionStatusId
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('updateRequestDTO', updateRequestDTO, returnBalance);
      const transaction = await queryRunner.manager.save(Transaction, createTransactionDto)
      await queryRunner.manager.update(Request, requestId, updateRequestDTO);
      
      if (returnBalance) {
        let oldBalance = null;
        let newBalance = null;
        const numberDaysRequested = await this.requestDayService.countByRequestId(requestId);
        const balance = await this.balanceService.findOneByUserId(request.userId);
        let updateBalanceDto: UpdateBalanceDto;
        
        if (request.typeId == RequestType.compDay) {
          updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
            balance.id,
            BalanceOperation.addition,
            numberDaysRequested
          );
          oldBalance = balance.compDays;
          newBalance = updateBalanceDto.compDays;
        }
        if (request.typeId == RequestType.vacation) {
          updateBalanceDto = await this.balanceService.validateVacationsUpdate(
            balance.id,
            BalanceOperation.addition,
            numberDaysRequested
          );
          oldBalance = balance.vacationDays;
          newBalance = updateBalanceDto.vacationDays;
        }

        await queryRunner.manager.delete(RequestDay, { requestId });
        await queryRunner.manager.update(Balance, balance.id, updateBalanceDto);
        await queryRunner.manager.save(BalanceTransaction, {
          balanceId: balance.id,
          typeId: request.typeId,
          operation: BalanceOperation.addition,
          amount: numberDaysRequested,
          oldBalance: oldBalance,
          newBalance: newBalance,
          comment: 'Request denied or canceled'
        });
      }

      await queryRunner.commitTransaction();

      return transaction;
    } catch (err) {
      console.log('Wr', err);
      await queryRunner.rollbackTransaction();

      throw new CustomRpcException('Error executing create transaction SQL transaction', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find();
  }
  
  async findAllByUserId(userId: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({ where: { requestId: userId } });
  }

  async findAllByRequestId(requestId: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({ where: { requestId } });
  }

  async findByRangeDate(startDate: string, endDate: string): Promise<Transaction[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return await this.transactionRepository.find({
      where: {
        createdAt: Between(start, end)
      }
    });
  }

  async findByUserIdAndRangeDate(userID: number, startDate: string, endDate: string): Promise<Transaction[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return await this.transactionRepository.find({
      where: {
        createdBy: userID,
        createdAt: Between(start, end)
      }
    });
  }

  async findOne(id: number): Promise<Transaction> {
    return await this.transactionRepository.findOne({ where: { id: id } });
  }

  async validateCreate(hr: number, roleId: number, request: Request, transactionStatusId: number): Promise<any> {
    if (transactionStatusId === TransactionStatus.approvedByTL) {
      if ((roleId === Role.admin || roleId === Role.coach || roleId === Role.jrCoach) &&
        request.statusId === RequestStatus.pending &&
        request.coachApproval === ApproveStatus.notApproved) {
        const updateRequestDTO = { coachApproval: 1 } as UpdateRequestDto;

        return { updateRequestDTO, returnBalance: false };
      }

      throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
    }
    if (transactionStatusId === TransactionStatus.approvedByHR) {
      if (hr === Hr.is &&
        request.statusId === RequestStatus.pending &&
        request.coachApproval === ApproveStatus.approved &&
        request.hrApproval === ApproveStatus.notApproved) {
        const updateRequestDTO = { hrApproval: 1, statusId: RequestStatus.approved } as UpdateRequestDto;

        return { updateRequestDTO, returnBalance: false };
      }

      throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
    }
    if (transactionStatusId === TransactionStatus.deniedByTL) {
      if ((roleId === Role.admin || roleId === Role.coach || roleId === Role.jrCoach) &&
        request.statusId === RequestStatus.pending) {
        const updateRequestDTO = { coachApproval: 0, statusId: RequestStatus.denied } as UpdateRequestDto;

        return { updateRequestDTO, returnBalance: true };
      }

      throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
    }
    if (transactionStatusId === TransactionStatus.deniedByHR) {
      if (hr === Hr.is &&
        request.statusId === RequestStatus.pending &&
        request.coachApproval === ApproveStatus.approved) {
        const updateRequestDTO = { hrApproval: 0, statusId: RequestStatus.denied } as UpdateRequestDto;

        return { updateRequestDTO, returnBalance: true };
      }

      throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
    }
    if (transactionStatusId === TransactionStatus.cancelledByHR) {
      if (hr === Hr.is &&
        request.statusId === RequestStatus.approved &&
        request.hrApproval === ApproveStatus.approved) {
        const updateRequestDTO = { statusId: RequestStatus.cancelled } as UpdateRequestDto;
        
        if (request.typeId == RequestType.licenciaExtraordinaria ||
            request.typeId == RequestType.medicalLeave ||
            request.typeId == RequestType.permisoSinGoce) {
          return { updateRequestDTO, returnBalance: false };
        }

        return { updateRequestDTO, returnBalance: true };
      }

      throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
    }

    throw new CustomRpcException('Unauthorized to make this transaction'
      , HttpStatus.FORBIDDEN, 'Unauthorized');
  }
}