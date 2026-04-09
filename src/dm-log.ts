export interface DmEntry {
  id: string; timestamp: string; userId: string;
  username: string | null; message: string;
  status: "success" | "error"; reply: string;
}

const entries: DmEntry[] = [];

export function addEntry(entry: Omit<DmEntry, "id">) {
  entries.unshift({ id: Math.random().toString(36).slice(2), ...entry });
  if (entries.length > 50) entries.splice(50);
}

export function getEntries() { return entries; }
