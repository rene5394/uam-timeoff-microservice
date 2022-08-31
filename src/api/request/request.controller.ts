import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @MessagePattern('createRequest')
  create(@Payload() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
  }

  @MessagePattern('findAllRequest')
  findAll() {
    return this.requestService.findAll();
  }

  @MessagePattern('findAllUserIdRequest')
  findAllByUserId(@Payload() userId: number) {
    return this.requestService.findAllByUserId(userId);
  }  

  @MessagePattern('findOneRequest')
  findOne(@Payload() id: number) {
    return this.requestService.findOne(id);
  }
}
