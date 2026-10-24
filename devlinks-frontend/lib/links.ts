import type { LinkItem } from "@/types";

/** Antepone https:// cuando el usuario escribe una URL sin protocolo. */
export function normalizeUrl(raw: string): string {
  const url = raw.trim();
  return url && !/^[a-z][a-z0-9+.-]*:/i.test(url) ? `https://${url}` : url;
}

export type ScheduleState = "none" | "scheduled" | "live" | "expired";

/** Misma regla que el backend: visible si start <= ahora < end. */
export function getScheduleState(
  link: Pick<LinkItem, "scheduledStart" | "scheduledEnd">,
  now = Date.now(),
): ScheduleState {
  const start = link.scheduledStart ? Date.parse(link.scheduledStart) : null;
  const end = link.scheduledEnd ? Date.parse(link.scheduledEnd) : null;
  if (start === null && end === null) return "none";
  if (start !== null && now < start) return "scheduled";
  if (end !== null && now >= end) return "expired";
  return "live";
}

/** ISO → valor para <input type="datetime-local"> (hora local). */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatSchedule(iso: string): string {
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
