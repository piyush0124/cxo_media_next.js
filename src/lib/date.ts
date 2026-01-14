function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return "th"; // 11th–13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatDateStable(dateInput?: string | Date) {
  if (!dateInput) return "";

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const suffix = getOrdinalSuffix(day);

  const monthYear = d.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return `${day}${suffix} ${monthYear}`;
}
