export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vaqt yo'q";

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatMoney(value) {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so'm`;
}

export function createOrderId() {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `PF-${datePart}-${randomPart}`;
}

export function isToday(order) {
  const today = new Date().toDateString();
  const date = new Date(order.createdAt);
  return !Number.isNaN(date.getTime()) && date.toDateString() === today;
}
