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
  findAll(@Payload() findParams: any): Promise<Balance[]> {
    const { page, userIds } = findParams;

    return this.balanceService.findAll(page, userIds);
  }

  @MessagePattern('findOneBalance')
  findOne(@Payload() id: number): Promise<Balance> {
    return this.balanceService.findOne(id);
  }

  @MessagePattern('findOneUserIdBalance')
  findOneByUserId(@Payload() userId: number): Promise<Balance> {
    return this.balanceService.findOneByUserId(userId);
  }

  @MessagePattern('updateBalance')
  async update(@Payload() payload) {
    const balanceId = await this.balanceService.update(payload.id, payload.updatedBy, payload.updateBalanceDto);

    return await this.balanceService.findOne(balanceId);
  }

  @MessagePattern('updateUserIdBalance')
  updateByUserId(@Payload() payload) {
    return this.balanceService.update(payload.userId, payload.updatedBy, payload.updateBalanceDto);
  }
}
