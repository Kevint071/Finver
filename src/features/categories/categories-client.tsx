"use client";

import { useState } from "react";
import { Tag, Trash2, Pencil, Check, X } from "lucide-react";
import { CreateCategoryForm } from "./create-category-form";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface CategoriesClientProps {
  categories: Category[];
  userRole: string;
}

export function CategoriesClient({ categories: initialCategories, userRole }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingRename, setIsSavingRename] = useState(false);

  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  async function handleCategoryCreated(newCategory: Category) {
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function startRename(category: Category) {
    setConfirmId(null);
    setEditingId(category.id);
    setEditingName(category.name);
    setEditError(null);
  }

  function cancelRename() {
    setEditingId(null);
    setEditingName("");
    setEditError(null);
  }

  async function handleRename(categoryId: string) {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditError("El nombre es requerido");
      return;
    }
    if (trimmed.length > 30) {
      setEditError("Máximo 30 caracteres");
      return;
    }
    setIsSavingRename(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const updated: Category = await res.json();
        setCategories((prev) =>
          prev
            .map((c) => (c.id === categoryId ? { ...c, name: updated.name } : c))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        setEditingName("");
        setEditError(null);
      } else {
        const data = await res.json();
        setEditError(data.error?.name?.[0] ?? "Error al renombrar");
      }
    } catch {
      setEditError("Error de red, intenta de nuevo");
    }
    setIsSavingRename(false);
  }

  async function handleDeactivate(categoryId: string) {
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch {
      // silently fail
    }
    setIsDeactivating(false);
    setConfirmId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorías</h1>
      </div>

      {canManage && <CreateCategoryForm onCreated={handleCategoryCreated} />}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <Tag className="mx-auto size-10 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No hay categorías aún</p>
          <p className="mt-1 text-xs text-zinc-500">
            {canManage
              ? "Crea tu primera categoría para organizar tus movimientos"
              : "Tu administrador aún no ha creado categorías"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                  <Tag className="size-4 text-zinc-400" />
                </div>
                {editingId === category.id ? (
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => {
                          setEditingName(e.target.value);
                          setEditError(null);
                        }}
                        maxLength={31}
                        autoFocus
                        aria-label="Nuevo nombre de categoría"
                        className="min-w-0 flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(category.id)}
                        disabled={isSavingRename || !editingName.trim() || editingName.trim().length > 30}
                        aria-label="Guardar nombre"
                        className="rounded p-1 text-emerald-400 hover:bg-zinc-800 disabled:opacity-40"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        aria-label="Cancelar"
                        className="rounded p-1 text-zinc-500 hover:bg-zinc-800"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    {editError && (
                      <p className="text-xs text-red-400">{editError}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-medium">{category.name}</span>
                )}
              </div>

              {canManage && editingId !== category.id && (
                <div className="ml-3 flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startRename(category)}
                    aria-label={`Renombrar ${category.name}`}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <Pencil className="size-4" />
                  </button>
                  {confirmId === category.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeactivate(category.id)}
                        disabled={isDeactivating}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {isDeactivating ? "..." : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(category.id)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                      aria-label={`Desactivar ${category.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
