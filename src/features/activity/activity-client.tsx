"use client";

import { DateSeparator } from "@/features/shared/date-separator";

interface AuditLog {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  performer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ActivityClientProps {
  logs: AuditLog[];
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays}d`;
}

function groupByDay(logs: AuditLog[]): Map<string, AuditLog[]> {
  const groups = new Map<string, AuditLog[]>();
  for (const log of logs) {
    const date = new Date(log.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }
  return groups;
}

export function ActivityClient({ logs }: ActivityClientProps) {
  if (logs.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500">
        No hay actividad aún.
      </p>
    );
  }

  const grouped = groupByDay(logs);

  return (
    <div className="space-y-1">
      {Array.from(grouped.entries()).map(([key, dayLogs]) => {
        const dayDate = new Date(dayLogs[0].createdAt);
        return (
          <div key={key}>
            <DateSeparator date={dayDate} />
            <div className="space-y-2">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg p-2"
                >
                  {log.performer.image ? (
                    <img
                      src={log.performer.image}
                      alt={log.performer.name ?? ""}
                      className="size-7 shrink-0 rounded-full border border-zinc-700"
                    />
                  ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                      {log.performer.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200">
                      <span className="font-medium">{log.performer.name ?? "Usuario"}</span>{" "}
                      <span className="text-zinc-400">{log.description}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-600" suppressHydrationWarning>
                    {getRelativeTime(new Date(log.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
