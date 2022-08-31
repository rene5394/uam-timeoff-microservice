import { IsDate, IsInt, Min } from "@nestjs/class-validator";

export class CreateRequestDayDto {
    @IsInt()
    @Min(1)
    requestId: number;

    @IsDate()
    day: Date;
}
