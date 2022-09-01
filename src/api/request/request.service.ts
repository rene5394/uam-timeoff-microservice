import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaysAfterRequest, MaxDaysRequested, MaxRequestsByDay } from '../../common/constants';
import { DataSource, Repository } from 'typeorm';
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
import { Role } from '../../common/enums/role.enum';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/transactionStatus.enum';

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

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    return await this.requestRepository.save(createRequestDto);
  }

  async createByUser(createRequestDto: CreateRequestDto, roleId: number): Promise<Request> {
    const { userId, typeId, startDate, endDate } = createRequestDto;
    const startDateFormatted = new Date(startDate);
    const endDateFormatted = new Date(endDate);
    startDateFormatted.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const balance = await this.balanceService.findOneByUserId(userId);
    const isAdmin = (roleId === Role.admin) ? 1 : 0;
    const { updateBalanceDto, daysRequested } = (roleId === Role.admin) ?
    await this.validateCreateByUserAdmin(balance, typeId, startDateFormatted, endDateFormatted):
    await this.validateCreateByUser(balance, typeId, startDateFormatted, endDateFormatted);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { raw : { insertId } } = await queryRunner.manager.insert(Request, createRequestDto);
      await queryRunner.manager.update(Balance, balance.id, updateBalanceDto);
      daysRequested.map( async(day: Date) => {
        await queryRunner.manager.insert(RequestDay, { requestId: insertId, day, admin: isAdmin} );
      });
      await queryRunner.manager.insert(Transaction, { 
        requestId: insertId,
        createdBy: userId,
        transactionStatusId: TransactionStatus.createdByBP
      });

      queryRunner.commitTransaction();

      return await this.findOne(insertId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      
      throw new InternalServerException('Error executing create request SQL transaction');
    }
  }

  async findAll(): Promise<Request[]> {
   return await this.requestRepository.find();
  }

  async findAllByUserId(userId: number): Promise<Request[]> {
    return await this.requestRepository.find({ where: { userId }});
  }

  async findByUserId(userId: number): Promise<Request[]> {
    return await this.requestRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<Request> {
    return await this.requestRepository.findOne({ where: { id }});
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    return await this.requestRepository.update(id, updateRequestDto);
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
        throw new BadRequestException(`Amount of comp days must not be greater than ${MaxDaysRequested.compDays}`);
      }
      if (daysAfterToday < DaysAfterRequest.minDaysCompDays ||
        startDate > maxDateAfter) {
        throw new BadRequestException(`Comp days should be requested ${DaysAfterRequest.minDaysCompDays} days before and no more than ${DaysAfterRequest.maxMonths} months later`);
      }
      if (overDaysLimit) {
        throw new BadRequestException(`There are mote than ${MaxRequestsByDay.compDays} requests in one day of your request`);
      }

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new BadRequestException(updateBalanceDto.error);
      }

      return { updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.vacation) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysAfterToday = diffrenceBetweenDates(today, startDate);
      const numberOfRequestByDays = await this.requestDayService.countByDays(daysRequested);
      const overDaysLimit = numberOfRequestByDays.some((numberOfRequest) => {
        return numberOfRequest > MaxRequestsByDay.vacations - 1;
      });

      if (numberDaysRequested > MaxDaysRequested.vacations) {
        throw new BadRequestException(`Amount of vacations must not be greater than ${MaxDaysRequested.vacations}`);
      }
      if (daysAfterToday < DaysAfterRequest.minDaysVacations ||
        startDate > maxDateAfter) {
        throw new BadRequestException(`Comp days should be requested ${DaysAfterRequest.minDaysVacations} days before
        days before and no more than ${DaysAfterRequest.maxMonths} months later`);
      }
      if (overDaysLimit) {
        throw new BadRequestException(`There are mote than ${MaxRequestsByDay.vacations} requests in one day of your request`);
      }
      
      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new BadRequestException(updateBalanceDto.error);
      }

      return { updateBalanceDto, daysRequested};
    }

    throw new BadRequestException('Request type is not valid');
  }

  async validateCreateByUserAdmin(balance: Balance, typeId: number, startDate: Date, endDate: Date): Promise<any> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxDateAfter = new Date(today);
    maxDateAfter.setMonth(maxDateAfter.getMonth() + DaysAfterRequest.maxMonths);
        
    if (typeId === RequestType.compDay) {
      const daysRequested = daysBetweenDatesNoWeekends(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysBeforeRequest = diffrenceBetweenDates(today, startDate);

      if (numberDaysRequested > MaxDaysRequested.compDays) {
        throw new BadRequestException(`Amount of comp days must not be greater than ${MaxDaysRequested.compDays}`);
      }
      if (daysBeforeRequest < DaysAfterRequest.minDaysCompDays ||
        startDate > maxDateAfter) {
        throw new BadRequestException(`Comp days should be requested ${DaysAfterRequest.minDaysCompDays} before`);
      }

      const updateBalanceDto = await this.balanceService.validateCompDaysUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new BadRequestException(updateBalanceDto.error);
      }

      return { updateBalanceDto, daysRequested };
    }

    if (typeId === RequestType.vacation) {
      const daysRequested = daysBetweenDates(startDate, endDate);
      const numberDaysRequested = daysRequested.length;
      const daysBeforeRequest = diffrenceBetweenDates(today, startDate);

      if (numberDaysRequested > MaxDaysRequested.vacations) {
        throw new BadRequestException(`Amount of vacations must not be greater than ${MaxDaysRequested.vacations}`);
      }
      if (daysBeforeRequest < DaysAfterRequest.minDaysVacations) {
        throw new BadRequestException(`Comp days should be requested ${DaysAfterRequest.minDaysVacations} before`);
      }
      
      const updateBalanceDto = await this.balanceService.validateVacationsUpdate(
        balance.id,
        BalanceOperation.substraction,
        numberDaysRequested
      );

      if (updateBalanceDto.error) {
        throw new BadRequestException(updateBalanceDto.error);
      }

      return { updateBalanceDto, daysRequested};
    }

    throw new BadRequestException('Request type is not valid');
  }
}