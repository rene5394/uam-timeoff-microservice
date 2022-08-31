import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDayDto } from './create-request-day.dto';

export class UpdateRequestDayDto extends PartialType(CreateRequestDayDto) {
  id: number;
}
