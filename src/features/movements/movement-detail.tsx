"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";

interface Movement {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  movementDate: string;
  category: { id: string; name: string };
  creator: { id: string; name: string | null; image: string | null };
}

interface MovementDetailProps {
  movement: Movement;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function MovementDetail({ movement }: MovementDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(
    new Date(movement.movementDate).toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  async function handleSaveDate() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/movements/${movement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movementDate: dateValue }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const displayDate = new Date(movement.movementDate).toLocaleDateString(
    "es-CO",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="mb-2 ml-11 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="space-y-2 text-sm">
        {/* Creator */}
        <div className="flex items-center gap-2">
          {movement.creator.image ? (
            <img
              src={movement.creator.image}
              alt={movement.creator.name ?? ""}
              className="h-5 w-5 rounded-full border border-zinc-700"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400">
              {movement.creator.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          )}
          <span className="text-zinc-300">
            {movement.creator.name ?? "Usuario"}
          </span>
        </div>

        {/* Date (editable) */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Fecha:</span>
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
              <button
                onClick={handleSaveDate}
                disabled={saving}
                className="rounded p-1 text-emerald-400 hover:bg-zinc-800"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDateValue(
                    new Date(movement.movementDate).toISOString().split("T")[0]
                  );
                }}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-zinc-300">{displayDate}</span>
              <button
                onClick={() => setEditing(true)}
                className="rounded p-1 text-zinc-500 hover:text-zinc-300"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Monto:</span>
          <span
            className={
              movement.type === "INCOME" ? "text-emerald-400" : "text-red-400"
            }
          >
            {formatAmount(movement.amount)}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Categoría:</span>
          <span className="text-zinc-300">{movement.category.name}</span>
        </div>

        {/* Description */}
        {movement.description && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Descripción:</span>
            <span className="text-zinc-300">{movement.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
