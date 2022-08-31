export function daysBetweenDates(startDate: Date, endDate: Date): Date[] {
  let dates = [];

  while (endDate >= startDate) {
    dates.push(startDate);

    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}
  
export function daysBetweenDatesNoWeekends(startDate: Date, endDate: Date): Date[] {
  let dates = [];

  while (endDate >= startDate) {
    if (startDate.getDay() !== 5 && startDate.getDay() !== 6) {
      const date = new Date(startDate);
      dates.push(date);
    }

    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}
  
  
export function diffrenceBetweenDates(startDate: Date, endDate: Date) {
  return ((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
}
  
export function diffrenceBetweenDatesNoWeekends(startDate: Date, endDate: Date) {
  let weekdays = 0;

  while (endDate >= startDate) {
    if (startDate.getDay() !== 5 && startDate.getDay() !== 6) {
      weekdays++;
  }

  startDate.setDate(startDate.getDate() + 1);
}

  return weekdays;
}
