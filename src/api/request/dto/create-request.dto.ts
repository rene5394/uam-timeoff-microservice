export class CreateRequestDto {
  userId: number;
  createdBy: number;
  typeId: number;
  startDate: Date;
  endDate: Date;
  roleId: number;
  coachApproval: number;
}