export function daysBetweenDates(startDate: Date, endDate: Date): Date[] {
  let dates = [];
  const copyStartDate = new Date(startDate.getTime());

  while (endDate >= copyStartDate) {
    const date = new Date(copyStartDate);
    dates.push(date);

    copyStartDate.setDate(copyStartDate.getDate() + 1);
  }

  return dates;
}
  
export function daysBetweenDatesNoWeekends(startDate: Date, endDate: Date): Date[] {
  let dates = [];
  const copyStartDate = new Date(startDate.getTime());

  while (endDate >= copyStartDate) {
    if (copyStartDate.getDay() !== 5 && copyStartDate.getDay() !== 6) {
      const date = new Date(copyStartDate);
      dates.push(date);
    }

    copyStartDate.setDate(copyStartDate.getDate() + 1);
  }

  return dates;
}
  
  
export function diffrenceBetweenDates(startDate: Date, endDate: Date) {
  return ((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
}
  
export function diffrenceBetweenDatesNoWeekends(startDate: Date, endDate: Date) {
  let weekdays = 0;
  const copyStartDate = new Date(startDate.getTime());

  while (endDate >= copyStartDate) {
    if (copyStartDate.getDay() !== 5 && copyStartDate.getDay() !== 6) {
      weekdays++;
  }

  copyStartDate.setDate(copyStartDate.getDate() + 1);
}

  return weekdays;
}

export function getUTCDifference(): number {
  const date = new Date();
  const differenceUTC = date.getTimezoneOffset();

  return differenceUTC;
}