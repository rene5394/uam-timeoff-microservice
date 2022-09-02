import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionStatusService } from './transaction-status.service';

@Controller()
export class TransactionStatusController {
  constructor(private readonly transactionStatusService: TransactionStatusService) {}

  @MessagePattern('findAllTransactionStatus')
  findAll() {
    return this.transactionStatusService.findAll();
  }

  @MessagePattern('findOneTransactionStatus')
  findOne(@Payload() id: number) {
    return this.transactionStatusService.findOne(id);
  }
}
