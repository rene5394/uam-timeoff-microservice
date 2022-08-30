import { Test, TestingModule } from '@nestjs/testing';
import { BalanceTransactionController } from './balance-transaction.controller';
import { BalanceTransactionService } from './balance-transaction.service';

describe('BalanceTransactionController', () => {
  let controller: BalanceTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceTransactionController],
      providers: [BalanceTransactionService],
    }).compile();

    controller = module.get<BalanceTransactionController>(BalanceTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
