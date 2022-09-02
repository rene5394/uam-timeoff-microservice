import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BalanceTransactionService } from './balance-transaction.service';
import { CreateBalanceTransactionDto } from './dto/create-balance-transaction.dto';
import { BalanceTransaction } from './entities/balance-transaction.entity';

@Controller()
export class BalanceTransactionController {
  constructor(private readonly balanceTransactionService: BalanceTransactionService) {}

  @MessagePattern('createBalanceTransaction')
  create(@Payload() createBalanceTransactionDto: CreateBalanceTransactionDto) {
    return this.balanceTransactionService.create(createBalanceTransactionDto);
  }

  @MessagePattern('findAllBalanceTransaction')
  findAll(): Promise<BalanceTransaction[]> {
    return this.balanceTransactionService.findAll();
  }

  @MessagePattern('findAllUserIdBalanceTransaction')
  findAllByUser(@Payload() userId: number): Promise<BalanceTransaction[]> {
    return this.balanceTransactionService.findAllByUser(userId);
  }

  @MessagePattern('findOneBalanceTransaction')
  findOne(@Payload() id: number): Promise<BalanceTransaction> {
    return this.balanceTransactionService.findOne(id);
  }
}
