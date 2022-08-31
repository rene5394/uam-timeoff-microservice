import { Test, TestingModule } from '@nestjs/testing';
import { RequestDayService } from './request-day.service';

describe('RequestDayService', () => {
  let service: RequestDayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestDayService],
    }).compile();

    service = module.get<RequestDayService>(RequestDayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
