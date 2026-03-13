const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

export const formatDate = (date: Date) => dateFormatter.format(date);

