export enum RabbitMQ {
    TimeOffQueue = 'timeoff'
}

export const paginationLimit = {
    balances: 10
  }

export class DaysAfterRequest {
    static readonly minDaysCompDays = 15;
    static readonly minDaysVacations = 30;
    static readonly maxMonths = 6;
}

export class MaxDaysRequested {
    static readonly compDays = 15;
    static readonly vacations = 15;
    static readonly licenciaExtraordinaria = 15;
}

export class MaxRequestsByDay {
    static readonly compDays = 25;
    static readonly vacations = 25;
}