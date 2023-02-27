import { BalanceOperation } from "../../../common/enums/balanceOperation.enum";

export class CreateBulkVacationTransactionDto {
  userIds: [];
  typeId: number;
  operation: BalanceOperation;
  amount: number;
  oldBalance: number;
  newBalance: number;
  updatedBy: number;
}