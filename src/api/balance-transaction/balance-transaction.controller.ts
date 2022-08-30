import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BalanceTransactionService } from './balance-transaction.service';
import { CreateBalanceTransactionDto } from './dto/create-balance-transaction.dto';
import { UpdateBalanceTransactionDto } from './dto/update-balance-transaction.dto';

@Controller()
export class BalanceTransactionController {
  constructor(private readonly balanceTransactionService: BalanceTransactionService) {}

  @MessagePattern('createBalanceTransaction')
  create(@Payload() createBalanceTransactionDto: CreateBalanceTransactionDto) {
    return this.balanceTransactionService.create(createBalanceTransactionDto);
  }

  @MessagePattern('findAllBalanceTransaction')
  findAll() {
    return this.balanceTransactionService.findAll();
  }

  @MessagePattern('findOneBalanceTransaction')
  findOne(@Payload() id: number) {
    return this.balanceTransactionService.findOne(id);
  }

  @MessagePattern('updateBalanceTransaction')
  update(@Payload() updateBalanceTransactionDto: UpdateBalanceTransactionDto) {
    return this.balanceTransactionService.update(updateBalanceTransactionDto.id, updateBalanceTransactionDto);
  }

  @MessagePattern('removeBalanceTransaction')
  remove(@Payload() id: number) {
    return this.balanceTransactionService.remove(id);
  }
}
