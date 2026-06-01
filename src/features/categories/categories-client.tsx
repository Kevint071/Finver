"use client";

import { useState } from "react";
import { Tag, Trash2 } from "lucide-react";
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

  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  async function handleCategoryCreated(newCategory: Category) {
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleDeactivate(categoryId: string) {
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } finally {
      setIsDeactivating(false);
      setConfirmId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorías</h1>
      </div>

      {canManage && <CreateCategoryForm onCreated={handleCategoryCreated} />}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <Tag className="mx-auto h-10 w-10 text-zinc-600" />
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
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <Tag className="h-4 w-4 text-zinc-400" />
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>

              {canManage && (
                <>
                  {confirmId === category.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeactivate(category.id)}
                        disabled={isDeactivating}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {isDeactivating ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(category.id)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                      aria-label={`Desactivar ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
