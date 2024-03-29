import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaysAfterRequest, MaxDaysRequested, MaxRequestsByDay, paginationLimit } from '../../common/constants';
import { Brackets, DataSource, Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { Balance } from '../balance/entities/balance.entity';
import { BalanceOperation } from '../../common/enums/balanceOperation.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { RequestType } from '../../common/enums/requestType.enum';
import { daysBetweenDates, daysBetweenDatesNoWeekends, diffrenceBetweenDates } from '../../common/utils/timeValidation';
import { RequestDayService } from '../request-day/request-day.service';
import { RequestDay } from '../request-day/entities/request-day.entity';
import { BalanceTransaction } from '../balance-transaction/entities/balance-transaction.entity';
import { Role } from '../../common/enums/role.enum';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/transactionStatus.enum';
import { RequestStatus } from 'src/common/enums/requestStatus.enum';
import { CustomRpcException } from 'src/common/exception/custom-rpc.exception';
import { RequestUpdateBalance } from 'src/common/enums/requestUpdateBalance.enum';

@Injectable()
export class RequestService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @Inject(BalanceService)
    private readonly balanceService: BalanceService,
    @Inject(RequestDayService)
    private readonly requestDayService: RequestDayService
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<number> {
    const { userId, typeId, startDate, endDate, roleId } = createRequestDto;
    
    const startDateFormatted = new Date(startDate);
    const endDateFormatted = new Date(endDate);
    startDateFormatted.setUTCHours(0, 0, 0, 0);
    endDateFormatted.setUTCHours(23, 59, 59, 999);

    const balance = await this.balanceService.findOneByUserId(userId);
    const isAdmin = (roleId === Role.admin) ? 1 : 0;

    const { requestUpdateBalance, updateBalanceDto, daysRequested } = await this.validateCreateByHR(balance, typeId, startDateFormatted, endDateFormatted);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { raw : { insertId } } = await queryRunner.manager.insert(Request, createRequestDto);

      if (requestUpdateBalance === RequestUpdateBalance.yes) {
        await queryRunner.manager.update(Balance, balance.id, updateBalanceDto);

        const amount = daysRequested.length;
        let oldBalance = null;
        let newBalance = null;

        if (createRequestDto.typeId === RequestType.compDay) {
          oldBalance = balance.compDays;
          newBalance = updateBalanceDto.compDays;
        } if (createRequestDto.typeId === RequestType.vacation) {
          oldBalance = balance.vacationDays;
          newBalance = updateBalanceDto.vacationDays;
        }

        await queryRunner.manager.save(
          BalanceTransaction, {
            balanceId: balance.id,
            typeId: typeId,
            operation: BalanceOperation.substraction,
            amount: amount,
            oldBalance: oldBalance,
            newBalance: newBalance,
            comment: 'Request Created by admin',
            updatedBy: createRequestDto.createdBy
          }
        );
      }

      daysRequested.map( async(day: Date) => {
        day.setUTCHours(6, 0, 0, 0);
        await queryRunner.manager.insert(RequestDay, { requestId: insertId, day, admin: isAdmin} );
      });
      await queryRunner.manager.insert(Transaction, { 
        requestId: insertId,
        createdBy: userId,
        transactionStatusId: TransactionStatus.createdByHR
      });

      await queryRunner.commitTransaction();
      
      return insertId;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new CustomRpcException('Error executing create request SQL transaction'
      , HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
  }

  async createByCoach(createRequestDto: CreateRequestDto): Promise<number> {
    const { userId, typeId, startDate, endDate, roleId } = createRequestDto;
    
    const startDateFormatted = new Date(startDate);
    const endDateFormatted = new Date(endDate);
    startDateFormatted.setUTCHours(0, 0, 0, 0);
    endDateFormatted.setUTCHours(23, 59, 59, 999);

    const balance = await this.balanceService.findOneByUserId(userId);
    const isAdmin = (roleId === Role.admin) ? 1 : 0;

    const { requestUpdateBalance, updateBalanceDto, daysRequested } = await this.validateCreateByHR(balance, typeId, startDateFormatted, endDateFormatted);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { raw : { insertId } } = await queryRunner.manager.insert(Request, createRequestDto);

      if (requestUpdateBalance === RequestUpdateBalance.yes) {
        await queryRunner.manager.update(Balance, balance.id, updateBalanceDto);

        const amount = daysRequested.length;
        let oldBalance = null;
        let newBalance = null;

        if (createRequestDto.typeId === RequestType.compDay) {
          oldBalance = balance.compDays;
          newBalance = updateBalanceDto.compDays;
        } if (createRequestDto.typeId === RequestType.vacation) {
          oldBalance = balance.vacationDays;
          newBalance = updateBalanceDto.vacationDays;
        }

        await queryRunner.manager.save(
          BalanceTransaction, {
            balanceId: balance.id,
            typeId: typeId,
            operation: BalanceOperation.substraction,
            amount: amount,
            oldBalance: oldBalance,
            newBalance: newBalance,
            comment: 'Request created  by coach',
            updatedBy: createRequestDto.createdBy
          }
        );
      }

      daysRequested.map( async(day: Date) => {
        day.setUTCHours(6, 0, 0, 0);
        await queryRunner.manager.insert(RequestDay, { requestId: insertId, day, admin: isAdmin} );
      });
      await queryRunner.manager.insert(Transaction, { 
        requestId: insertId,
        createdBy: userId,
        transactionStatusId: TransactionStatus.createdByTL
      });

      await queryRunner.commitTransaction();
      
      return insertId;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new CustomRpcException('Error executing create request SQL transaction'
      , HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
  }

  async createByUser(createRequestDto: CreateRequestDto): Promise<number> {
    const { userId, typeId, startDate, endDate, roleId } = createRequestDto;
    const startDateFormatted = new Date(startDate);
    const endDateFormatted = new Date(endDate);
    startDateFormatted.setUTCHours(0, 0, 0, 0);
    endDateFormatted.setUTCHours(23, 59, 59, 999);

    const balance = await this.balanceService.findOneByUserId(userId);
    let isAdmin = 0;
    let transactionStatus = 0;
    
    if (roleId === Role.admin) {
      isAdmin = 1;
      transactionStatus = TransactionStatus.createdByAdmin;
      createRequestDto.coachApproval = 1;
    } if (roleId === Role.coach || roleId === Role.jrCoach) {
      transactionStatus = TransactionStatus.createdByTL;
      createRequestDto.coachApproval = 1;
    } if (roleId === Role.va) {
      transactionStatus = TransactionStatus.createdByBP;
    }

    const { updateBalanceDto, daysRequested } = (roleId === Role.admin) ?
    await this.validateCreateByUserAdmin(balance, typeId, startDateFormatted, endDateFormatted) :
    await this.validateCreateByUser(balance, typeId, startDateFormatted, endDateFormatted);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

      const { raw : { insertId } } = await queryRunner.manager.insert(Request, createRequestDto);
      await queryRunner.manager.update(Balance, balance.id, updateBalanceDto);

      const amount = daysRequested.length;
      let oldBalance = null;
      let newBalance = null;

      if (createRequestDto.typeId === RequestType.compDay) {
        oldBalance = balance.compDays;
        newBalance = updateBalanceDto.compDays;
      } if (createRequestDto.typeId === RequestType.vacation) {
        oldBalance = balance.vacationDays;
        newBalance = updateBalanceDto.vacationDays;
      }

      await queryRunner.manager.save(
        BalanceTransaction, {
          balanceId: balance.id,
          typeId: typeId,
          operation: BalanceOperation.substraction,
          amount: amount,
          oldBalance: oldBalance,
          newBalance: newBalance,
          comment: 'Request created  by user',
          updatedBy: createRequestDto.createdBy
        }
      );
      
      daysRequested.map( async(day: Date) => {
        day.setUTCHours(6, 0, 0, 0);
        await queryRunner.manager.insert(RequestDay, { requestId: insertId, day, admin: isAdmin} );
      });
      await queryRunner.manager.insert(Transaction, { 
        requestId: insertId,
        createdBy: userId,
        transactionStatusId: transactionStatus
      });

      await queryRunner.commitTransaction();
      
      return insertId;
  }

  async findAll(status: string, transactionStatus: string, page: number, userIds: any[], startDate: Date, endDate: Date) {
    const query = this.dataSource.getRepository(Request)
      .createQueryBuilder("requests")
      .leftJoinAndSelect("requests.transactions", "transactions");

    const keys = Object.keys(RequestStatus);
    let statusId = 0;

    Object.keys(RequestStatus).forEach(key => {
      if (key === status) {
        statusId = RequestStatus[key];
      }
    });

    const transactionKeys = Object.keys(TransactionStatus);
    let transactionStatusId = 0;

    Object.keys(TransactionStatus).forEach(key => {
      if (key === transactionStatus) {
        transactionStatusId = TransactionStatus[key];
      }
    });

    if (userIds) {
      query.where("requests.userId IN (:userIds)", { userIds });
    }

    if (statusId) {
      query.andWhere("requests.statusId = :statusId", { statusId });
    }

    if (transactionStatusId) {
        query.andWhere("transactions.id IN (SELECT MAX(id) FROM transactions WHERE requestId = requests.id)")
          .andWhere("transactions.transactionStatusId = :transactionStatusId", { transactionStatusId });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setUTCHours(6, 0, 0, 0);
      
      query.andWhere(new Brackets(qb => {
        qb.andWhere("requests.createdAt >= :startDate", { startDate: start });
        if (endDate) {
          const end = new Date(endDate);
          end.setUTCHours(29, 59, 59, 999);

          qb.andWhere("requests.createdAt <= :endDate", { endDate: end });
        } else {
          const end = new Date();

          qb.andWhere("requests.createdAt <= :endDate", { endDate: end });
        }
      }));
    }

    if (page) {
      query
        .skip((page -1) * paginationLimit.balances)
        .take(paginationLimit.balances);
    }

    const [list, count] = await Promise.all([
      query.getMany(),
      query.getCount()
    ]);
        
    return { list, count };
  }

  async findAllByUserId(userId: number, status: string): Promise<Request[]> {
    const keys = Object.keys(RequestStatus);
    let statusId = 0;

    Object.keys(RequestStatus).forEach(key => {
      if (key === status) {
        statusId = RequestStatus[key];
      }
    });

    if (statusId) {
      return await this.requestRepository.find({
        relations: {
          transactions: true,
        },
        where : { userId, statusId} });
    }

    return await this.requestRepository.find({
      relations: {
        transactions: true,
      },
      where: { userId }});
  }

  async findRequestsByYearAndMonth(year: number, month: number): Promise<any> {
    const startDate = new Date(year, month -1, 1);
    const endDate = new Date(year, month, 0);
    
    const daysRequested = daysBetweenDates(startDate, endDate);
    
    const requests = await this.requestDayService.findByDays(daysRequested);

    let requestsByDay = [];

    for (let i = 0; i < daysRequested.length; i++) {
      requestsByDay.push({
        day: daysRequested[i],
        requests: requests[i]
      });
    }

    return requestsByDay;
  }

  async findRequestsByDateRange(start: string, end: string): Promise<any> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setUTCHours(6, 0, 0, 0);
    endDate.setUTCHours(6, 0, 0, 0);
    
    const daysRequested = daysBetweenDates(startDate, endDate);

    const requests = await this.requestDayService.findByDays(daysRequested);

    let requestsByDays = [];

    for (let i = 0; i < daysRequested.length; i++) {
      requestsByDays.push({
        day: daysRequested[i],
        requests: requests[i]
      });
    }

    return requestsByDays;
  }

  async findNumberOfRequestsByYearAndMonth(year: number, month: number): Promise<any> {
    const startDate = new Date(year, month -1, 1);
    const endDate = new Date(year, month, 0);
    
    const daysRequested = daysBetweenDates(startDate, endDate);
    
    const numberOfRequestByDays = await this.requestDayService.countByDaysNoAdmin(daysRequested);

    let requestsByDay = [];

    for (let i = 0; i < daysRequested.length; i++) {
      requestsByDay.push({
        day: daysRequested[i],
        number: numberOfRequestByDays[i]
      });
    }

    return requestsByDay;
  }

  async findNumberOfRequestsByDateRange(start: string, end: string): Promise<any> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setUTCHours(6, 0, 0, 0);
    endDate.setUTCHours(6, 0, 0, 0);
    
    const daysRequested = daysBetweenDates(startDate, endDate);

    const numberOfRequestByDays = await this.requestDayService.countByDaysNoAdmin(daysRequested);

    let requestsByDay = [];

    for (let i = 0; i < daysRequested.length; i++) {
      requestsByDay.push({
        day: daysRequested[i],
        number: numberOfRequestByDays[i]
      });
    }

    return requestsByDay;
  }

  async findByUserId(userId: number): Promise<Request[]> {
    return await this.requestRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<Request> {
    return await this.requestRepository.findOne({ 
      relations: {
        transactions: true,
      },
      where: { id }
    });
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    return await this.requestRepository.update(id, updateRequestDto);
  }

  async validateCreateByHR(balance: Balance, typeId: number, startDate: Date, endDate: Date): Promise<any> {
    if (typeId === RequestType.compDay) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const numberDaysRequested = daysRequested.length;

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      const requestUpdateBalance = RequestUpdateBalance.yes;

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error, HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { requestUpdateBalance, updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.vacation) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const numberDaysRequested = daysRequested.length;

      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      const requestUpdateBalance = RequestUpdateBalance.yes;

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error, HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { requestUpdateBalance, updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.licenciaExtraordinaria) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const requestUpdateBalance = RequestUpdateBalance.no;

      return { requestUpdateBalance, undefined, daysRequested };
    }

    if (typeId === RequestType.medicalLeave) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const requestUpdateBalance = RequestUpdateBalance.no;

      return { requestUpdateBalance, undefined, daysRequested };
    }    

    if (typeId === RequestType.permisoSinGoce) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const requestUpdateBalance = RequestUpdateBalance.no;

      return { requestUpdateBalance, undefined, daysRequested };
    }    
  }

  async validateCreateByUser(balance: Balance, typeId: number, startDate: Date, endDate: Date): Promise<any> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxDateAfter = new Date(today);
    maxDateAfter.setMonth(maxDateAfter.getMonth() + DaysAfterRequest.maxMonths);
    
    if (typeId === RequestType.compDay) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysAfterToday = diffrenceBetweenDates(today, startDate);
      const numberOfRequestByDays = await this.requestDayService.countByDaysNoAdmin(daysRequested);
      const overDaysLimit = numberOfRequestByDays.some((numberOfRequest) => {
        return numberOfRequest > MaxRequestsByDay.compDays - 1;
      });
      
      if (numberDaysRequested > MaxDaysRequested.compDays) {
        throw new CustomRpcException(`Amount of comp days must not be greater than ${MaxDaysRequested.compDays} days`, 
        HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (daysAfterToday < DaysAfterRequest.minDaysCompDays ||
        startDate > maxDateAfter) {
          throw new CustomRpcException(`Comp days should be requested ${DaysAfterRequest.minDaysCompDays} 
          days before and no more than ${DaysAfterRequest.maxMonths} months later`, HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (overDaysLimit) {
        throw new CustomRpcException(`There are more than ${MaxRequestsByDay.compDays} requests in one day of your request`, 
        HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error, HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.vacation) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysAfterToday = diffrenceBetweenDates(today, startDate);
      const numberOfRequestByDays = await this.requestDayService.countByDaysNoAdmin(daysRequested);
      const overDaysLimit = numberOfRequestByDays.some((numberOfRequest) => {
        return numberOfRequest > MaxRequestsByDay.vacations - 1;
      });

      if (numberDaysRequested > MaxDaysRequested.vacations) {
        throw new CustomRpcException(`Amount of vacations must not be greater than ${MaxDaysRequested.vacations} days`, 
        HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (daysAfterToday < DaysAfterRequest.minDaysVacations ||
        startDate > maxDateAfter) {
          throw new CustomRpcException(`Vacations should be requested ${DaysAfterRequest.minDaysVacations} 
          days before and no more than ${DaysAfterRequest.maxMonths} months later`, HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (overDaysLimit) {
        throw new CustomRpcException(`There are mote than ${MaxRequestsByDay.vacations} requests in one day of your request`, 
        HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      
      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error, HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { updateBalanceDto, daysRequested};
    }

    throw new CustomRpcException('Request type is not valid', HttpStatus.BAD_REQUEST, 'Bad Request');
  }

  async validateCreateByUserAdmin(balance: Balance, typeId: number, startDate: Date, endDate: Date): Promise<any> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxDateAfter = new Date(today);
    maxDateAfter.setMonth(maxDateAfter.getMonth() + DaysAfterRequest.maxMonths);    

    if (typeId === RequestType.compDay) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysAfterToday = diffrenceBetweenDates(today, startDate);

      if (numberDaysRequested > MaxDaysRequested.compDays) {
        throw new CustomRpcException(`Amount of comp days must not be greater than ${MaxDaysRequested.compDays} days`
        , HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (daysAfterToday < DaysAfterRequest.minDaysCompDays ||
        startDate > maxDateAfter) {
        throw new CustomRpcException(`Comp days should be requested ${DaysAfterRequest.minDaysCompDays} days before`
        , HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error
        , HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.vacation) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysAfterToday = diffrenceBetweenDates(today, startDate);
      
      if (numberDaysRequested > MaxDaysRequested.vacations) {
        throw new CustomRpcException(`Amount of vacations must not be greater than ${MaxDaysRequested.vacations} days`
        , HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      if (daysAfterToday < DaysAfterRequest.minDaysVacations) {
        throw new CustomRpcException(`Vacations should be requested ${DaysAfterRequest.minDaysVacations} days before`
        , HttpStatus.BAD_REQUEST, 'Bad Request');
      }
      
      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new CustomRpcException(updateBalanceDto.error, HttpStatus.BAD_REQUEST, 'Bad Request');
      }

      return { updateBalanceDto, daysRequested};
    }

    throw new CustomRpcException('Request type is not valid', HttpStatus.BAD_REQUEST, 'Bad Request');
  }
}
