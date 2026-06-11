"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";

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
  canEdit: boolean;
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
});

function formatAmount(amount: number): string {
  return copFormatter.format(amount);
}

export function MovementDetail({ movement, canEdit }: MovementDetailProps) {
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
            <Image
              src={movement.creator.image}
              alt={movement.creator.name ?? ""}
              width={20}
              height={20}
              className="size-5 rounded-full border border-zinc-700"
            />
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400">
              {movement.creator.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          )}
          <span className="text-zinc-300">
            {movement.creator.name ?? "Usuario"}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Fecha:</span>
          <span className="text-zinc-300">{displayDate}</span>
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

        {/* Edit link */}
        {canEdit && (
          <div className="pt-1">
            <Link
              href={`/movements/${movement.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Pencil className="size-3" />
              Editar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
