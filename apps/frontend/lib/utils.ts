export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function normalizeReturnTo(value?: string | null) {
  if (!value) {
    return "/app";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }

  return value;
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const normalized = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(normalized)) {
    return String(value);
  }

  return new Intl.NumberFormat("ko-KR").format(normalized);
}
