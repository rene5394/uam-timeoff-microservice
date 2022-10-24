export class CreateRequestDto {
  userId: number;
  comment: string;
  createdBy: number;
  typeId: number;
  startDate: Date;
  endDate: Date;
  roleId: number;
  coachApproval: number;
}