import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionStatusService } from './transaction-status.service';
import { CreateTransactionStatusDto } from './dto/create-transaction-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller()
export class TransactionStatusController {
  constructor(private readonly transactionStatusService: TransactionStatusService) {}

  @MessagePattern('createTransactionStatus')
  create(@Payload() createTransactionStatusDto: CreateTransactionStatusDto) {
    return this.transactionStatusService.create(createTransactionStatusDto);
  }

  @MessagePattern('findAllTransactionStatus')
  findAll() {
    return this.transactionStatusService.findAll();
  }

  @MessagePattern('findOneTransactionStatus')
  findOne(@Payload() id: number) {
    return this.transactionStatusService.findOne(id);
  }

  @MessagePattern('updateTransactionStatus')
  update(@Payload() updateTransactionStatusDto: UpdateTransactionStatusDto) {
    return this.transactionStatusService.update(updateTransactionStatusDto.id, updateTransactionStatusDto);
  }

  @MessagePattern('removeTransactionStatus')
  remove(@Payload() id: number) {
    return this.transactionStatusService.remove(id);
  }
}
