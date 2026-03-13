const BLOG_TIME_ZONE = "America/Chicago";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: BLOG_TIME_ZONE,
});

const padNumber = (value: number) => value.toString().padStart(2, "0");

const getCalendarDateParts = (date: Date) => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
  day: date.getUTCDate(),
});

export const formatDate = (date: Date) => {
  const { year, month, day } = getCalendarDateParts(date);
  const stableDate = new Date(Date.UTC(year, month - 1, day, 12));

  return dateFormatter.format(stableDate);
};

export const getDateSortKey = (date: Date, time: string) => {
  const { year, month, day } = getCalendarDateParts(date);

  return `${year}-${padNumber(month)}-${padNumber(day)}T${time}`;
};
