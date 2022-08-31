import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StatusService } from './status.service';
import { Status } from './entities/status.entity';

@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @MessagePattern('findAllStatus')
  findAll(): Promise<Status[]> {
    return this.statusService.findAll();
  }

  @MessagePattern('findOneStatus')
  findOne(@Payload() id: number): Promise<Status> {
    return this.statusService.findOne(id);
  }
}
