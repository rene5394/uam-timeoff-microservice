import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BalanceService } from './balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { Balance } from './entities/balance.entity';

@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @MessagePattern('createBalance')
  create(@Payload() createBalanceDto: CreateBalanceDto): Promise<Balance> {
    return this.balanceService.create(createBalanceDto);
  }

  @MessagePattern('findAllBalance')
  findAll(): Promise<Balance[]> {
    return this.balanceService.findAll();
  }

  @MessagePattern('findOneBalance')
  findOne(@Payload() id: number): Promise<Balance> {
    return this.balanceService.findOne(id);
  }

  @MessagePattern('updateBalance')
  update(@Payload() payload) {
    return this.balanceService.update(payload.id, payload.updateBalanceDto);
  }
}
