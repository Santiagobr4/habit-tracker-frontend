const LONG_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

const SHORT_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

const READABLE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const getIsoDateLabel = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.slice(5);
};

export const getIsoDayNameLong = (isoDate) => {
  if (!isoDate) return "";
  return LONG_DAY_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
};

export const getIsoDayNameShort = (isoDate) => {
  if (!isoDate) return "";
  return SHORT_DAY_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
};

export const capitalizeDayCode = (value) => {
  if (!value) return "";
  return value.slice(0, 1).toUpperCase() + value.slice(1, 3).toLowerCase();
};

export const formatReadableDate = (isoDate) => {
  if (!isoDate) return "";
  return READABLE_DATE_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
};

export const formatReadableDateRange = (startDate, endDate) => {
  const startLabel = formatReadableDate(startDate);
  const endLabel = formatReadableDate(endDate);

  if (!startLabel || !endLabel) return "";

  return `${startLabel} to ${endLabel}`;
};
