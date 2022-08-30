import { Test, TestingModule } from '@nestjs/testing';
import { BalanceTransactionService } from './balance-transaction.service';

describe('BalanceTransactionService', () => {
  let service: BalanceTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalanceTransactionService],
    }).compile();

    service = module.get<BalanceTransactionService>(BalanceTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
