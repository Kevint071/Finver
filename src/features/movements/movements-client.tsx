"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DateSeparator } from "@/features/shared/date-separator";
import { MovementDetail } from "./movement-detail";

interface Movement {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  movementDate: string;
  createdAt: string;
  category: { id: string; name: string };
  creator: { id: string; name: string | null; image: string | null };
}

interface MovementsClientProps {
  movements: Movement[];
}

function groupByDay(movements: Movement[]): Map<string, Movement[]> {
  const groups = new Map<string, Movement[]>();
  for (const m of movements) {
    const date = new Date(m.movementDate);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return groups;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function MovementsClient({ movements }: MovementsClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (movements.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500">
        No hay movimientos aún.
      </p>
    );
  }

  const grouped = groupByDay(movements);

  return (
    <div className="space-y-1">
      {Array.from(grouped.entries()).map(([key, dayMovements]) => {
        const dayDate = new Date(dayMovements[0].movementDate);
        return (
          <div key={key}>
            <DateSeparator date={dayDate} />
            <div className="space-y-1">
              {dayMovements.map((m) => (
                <div key={m.id}>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === m.id ? null : m.id)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-zinc-800/50"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        m.type === "INCOME"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-red-950 text-red-400"
                      }`}
                    >
                      {m.type === "INCOME" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {m.description || m.category.name}
                      </p>
                      <p className="text-xs text-zinc-500">{m.category.name}</p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        m.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {m.type === "INCOME" ? "+" : "-"}
                      {formatAmount(m.amount)}
                    </span>
                  </button>
                  {expandedId === m.id && <MovementDetail movement={m} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
