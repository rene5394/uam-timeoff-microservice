import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@Controller()
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @MessagePattern('findAllType')
  findAll() {
    return this.typeService.findAll();
  }

  @MessagePattern('findOneType')
  findOne(@Payload() id: number) {
    return this.typeService.findOne(id);
  }
}
