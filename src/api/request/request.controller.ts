import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestService } from './request.service';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @MessagePattern('createRequest')
  async create(@Payload() createRequestDto: CreateRequestDto) {
    return await this.requestService.create(createRequestDto);
  }

  @MessagePattern('createUserIdRequest')
  async createByUserId(@Payload() createRequestDto: CreateRequestDto) {
    const requestId = await this.requestService.createByUser(createRequestDto);

    return await this.requestService.findOne(requestId);
  }

  @MessagePattern('findAllRequest')
  findAll() {
    return this.requestService.findAll();
  }

  @MessagePattern('findAllUserIdRequest')
  findAllByUserId(@Payload() findParams: any) {
    const { userId, status } = findParams;

    return this.requestService.findAllByUserId(userId, status);
  }

  @MessagePattern('findRequestByYearAndMonth')
  findRequestsByYearAndMonth(@Payload() findParams: any) {
    const { year, month } = findParams;
    
    return this.requestService.findRequestsByYearAndMonth(year, month);
  }

  @MessagePattern('findRequestByDateRange')
  findRequestsByDateRange(@Payload() dateRange: any) {
    const { startDate, endDate } = dateRange;
    
    return this.requestService.findRequestsByDateRange(startDate, endDate);
  }

  @MessagePattern('findNumberOfRequestByYearAndMonth')
  findNumberOfRequestsByYearAndMonth(@Payload() findParams: any) {
    const { year, month } = findParams;
    
    return this.requestService.findNumberOfRequestsByYearAndMonth(year, month);
  }

  @MessagePattern('findNumberOfRequestByDateRange')
  findNumberOfRequestsByDateRange(@Payload() dateRange: any) {
    const { startDate, endDate } = dateRange;
    
    return this.requestService.findNumberOfRequestsByDateRange(startDate, endDate);
  }

  @MessagePattern('findOneRequest')
  findOne(@Payload() id: number) {
    return this.requestService.findOne(id);
  }
}
