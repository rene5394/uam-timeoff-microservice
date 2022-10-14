import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @MessagePattern('createTransaction')
  create(@Payload() createData: any) {
    const {roleId, hr, createTransactionDto} = createData;    

    return this.transactionService.create(roleId, hr, createTransactionDto);
  }

  @MessagePattern('findAllTransaction')
  findAll() {
    return this.transactionService.findAll();
  }

  @MessagePattern('findAllUserIdTransaction')
  findAllByUserId(@Payload() userId: number) {
    return this.transactionService.findAllByUserId(userId);
  }

  @MessagePattern('findAllRequestIdTransaction')
  findAllByRequestId(@Payload() requestId: number) {
    return this.transactionService.findAllByRequestId(requestId);
  }

  @MessagePattern('findOneTransaction')
  findOne(@Payload() id: number) {
    return this.transactionService.findOne(id);
  }
}
