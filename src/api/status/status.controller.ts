import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @MessagePattern('findAllStatus')
  findAll() {
    return this.statusService.findAll();
  }

  @MessagePattern('findOneStatus')
  findOne(@Payload() id: number) {
    return this.statusService.findOne(id);
  }
}
