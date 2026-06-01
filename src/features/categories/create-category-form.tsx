"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface CreateCategoryFormProps {
  onCreated: (category: Category) => void;
}

export function CreateCategoryForm({ onCreated }: CreateCategoryFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es requerido");
      return;
    }
    if (trimmed.length > 30) {
      setError("Máximo 30 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.name?.[0] ?? "Error al crear categoría");
      } else {
        const category = await res.json();
        onCreated({ id: category.id, name: category.name, isActive: category.isActive });
        setName("");
      }
    } catch {
      setError("Error de conexión");
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nueva categoría..."
          aria-label="Nombre de nueva categoría"
          maxLength={30}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <div className="min-h-5 mt-1">
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Crear</span>
      </button>
    </form>
  );
}
