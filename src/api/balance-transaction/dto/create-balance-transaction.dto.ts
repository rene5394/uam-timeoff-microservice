import { BalanceOperation } from "../../../common/enums/balanceOperation.enum";

export class CreateBalanceTransactionDto {
  balanceId: number;
  typeId: number;
  operation: BalanceOperation;
  amount: number;
  oldBalance: number;
  newBalance: number;
  comment: string;
  updatedBy: number;
}