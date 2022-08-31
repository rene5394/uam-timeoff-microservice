import { Injectable } from '@nestjs/common';
import { CreateRequestDayDto } from './dto/create-request-day.dto';
import { UpdateRequestDayDto } from './dto/update-request-day.dto';

@Injectable()
export class RequestDayService {
  create(createRequestDayDto: CreateRequestDayDto) {
    return 'This action adds a new requestDay';
  }

  findAll() {
    return `This action returns all requestDay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requestDay`;
  }

  update(id: number, updateRequestDayDto: UpdateRequestDayDto) {
    return `This action updates a #${id} requestDay`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestDay`;
  }
}
