import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TypeService } from './type.service';
import { Type } from './entities/type.entity';

@Controller()
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @MessagePattern('findAllType')
  findAll(): Promise<Type[]> {
    return this.typeService.findAll();
  }

  @MessagePattern('findOneType')
  findOne(@Payload() id: number): Promise<Type> {
    return this.typeService.findOne(id);
  }
}
