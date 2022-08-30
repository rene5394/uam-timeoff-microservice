import { PartialType } from '@nestjs/mapped-types';
import { CreateBalanceTransactionDto } from './create-balance-transaction.dto';

export class UpdateBalanceTransactionDto extends PartialType(CreateBalanceTransactionDto) {
  id: number;
}
