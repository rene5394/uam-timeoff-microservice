import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionStatusDto } from './create-transaction-status.dto';

export class UpdateTransactionStatusDto extends PartialType(CreateTransactionStatusDto) {
  id: number;
}
