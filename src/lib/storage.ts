import { Incident } from "./types";

const STORAGE_KEY = "wcc_incidents";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadIncidents(): Incident[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveIncidents(incidents: Incident[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

export function getIncident(id: string): Incident | undefined {
  return loadIncidents().find((inc) => inc.id === id);
}

export function createIncident(incident: Incident): void {
  const incidents = loadIncidents();
  incidents.unshift(incident);
  saveIncidents(incidents);
}

export function updateIncident(updated: Incident): void {
  const incidents = loadIncidents().map((inc) =>
    inc.id === updated.id ? updated : inc
  );
  saveIncidents(incidents);
}

export function deleteIncident(id: string): void {
  const incidents = loadIncidents().filter((inc) => inc.id !== id);
  saveIncidents(incidents);
}
