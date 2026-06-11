"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Movement {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  movementDate: string; // ISO string
  category: { id: string; name: string };
}

interface MovementEditFormProps {
  movement: Movement;
  categories: Category[];
}

export function MovementEditForm({ movement, categories }: MovementEditFormProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/movements/${movement.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/movements");
        router.refresh();
      }
    } catch {
      // silently fail
    }
    setDeleting(false);
    setConfirmDelete(false);
  }

  const [date, setDate] = useState(
    new Date(movement.movementDate).toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState(String(movement.amount));
  const [categoryId, setCategoryId] = useState(movement.category.id);
  const [description, setDescription] = useState(movement.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!date) next.date = "La fecha es requerida";

    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
      next.amount = "El monto debe ser un número entero positivo";
    }

    if (!categoryId) next.categoryId = "La categoría es requerida";

    if (description.length > 200) next.description = "Máximo 200 caracteres";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        movementDate: date,
        amount: Number(amount),
        categoryId,
        description: description.trim() || null,
      };

      const res = await fetch(`/api/movements/${movement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/movements");
        router.refresh();
      } else {
        const data = await res.json();
        if (typeof data.error === "object" && data.error !== null) {
          const apiErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.error)) {
            apiErrors[k] = Array.isArray(v) ? (v[0] as string) : String(v);
          }
          setErrors(apiErrors);
        } else {
          setErrors({ form: data.error ?? "Error al guardar" });
        }
      }
    } catch {
      setErrors({ form: "Error de red, intenta de nuevo" });
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.form && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {errors.form}
        </p>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <label htmlFor="mov-date" className="block text-sm font-medium text-zinc-300">
          Fecha
        </label>
        <input
          id="mov-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <label htmlFor="mov-amount" className="block text-sm font-medium text-zinc-300">
          Monto (COP)
        </label>
        <input
          id="mov-amount"
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label htmlFor="mov-category" className="block text-sm font-medium text-zinc-300">
          Categoría
        </label>
        <select
          id="mov-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-red-400">{errors.categoryId}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="mov-description" className="block text-sm font-medium text-zinc-300">
          Descripción{" "}
          <span className="font-normal text-zinc-500">(opcional)</span>
        </label>
        <textarea
          id="mov-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agrega una descripción..."
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* Delete */}
      <div className="border-t border-zinc-800 pt-4">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="flex-1 text-sm text-zinc-400">¿Eliminar este movimiento?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? "..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            Eliminar movimiento
          </button>
        )}
      </div>
    </form>
  );
}
