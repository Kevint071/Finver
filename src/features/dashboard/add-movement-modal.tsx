"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface AddMovementModalProps {
  onClose: () => void;
  categories: Category[];
}

type ModalState = {
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  amount: string;
  description: string;
  movementDate: string;
  error: string;
  loading: boolean;
};

type ModalAction =
  | { type: "SET_TYPE"; value: "INCOME" | "EXPENSE" }
  | { type: "SET_CATEGORY"; value: string }
  | { type: "SET_AMOUNT"; value: string }
  | { type: "SET_DESCRIPTION"; value: string }
  | { type: "SET_DATE"; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "SUBMIT_DONE" };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, type: action.value };
    case "SET_CATEGORY":
      return { ...state, categoryId: action.value };
    case "SET_AMOUNT":
      return { ...state, amount: action.value };
    case "SET_DESCRIPTION":
      return { ...state, description: action.value };
    case "SET_DATE":
      return { ...state, movementDate: action.value };
    case "SUBMIT_START":
      return { ...state, loading: true, error: "" };
    case "SUBMIT_ERROR":
      return { ...state, loading: false, error: action.message };
    case "SUBMIT_DONE":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AddMovementModal({ onClose, categories }: AddMovementModalProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(modalReducer, {
    type: "EXPENSE",
    categoryId: categories[0]?.id ?? "",
    amount: "",
    description: "",
    movementDate: new Date().toISOString().split("T")[0],
    error: "",
    loading: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "SUBMIT_START" });

    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: state.type,
          categoryId: state.categoryId,
          amount: parseInt(state.amount, 10),
          description: state.description || undefined,
          movementDate: state.movementDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        dispatch({
          type: "SUBMIT_ERROR",
          message: typeof data.error === "string" ? data.error : "Error al registrar",
        });
      } else {
        dispatch({ type: "SUBMIT_DONE" });
        router.refresh();
        onClose();
      }
    } catch {
      dispatch({ type: "SUBMIT_ERROR", message: "Error de conexión" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl border border-zinc-800 bg-zinc-900 p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo movimiento</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-zinc-800">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="flex rounded-lg border border-zinc-700 p-1">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TYPE", value: "EXPENSE" })}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                state.type === "EXPENSE"
                  ? "bg-red-400/10 text-red-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TYPE", value: "INCOME" })}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                state.type === "INCOME"
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-zinc-300">
              Monto (COP)
            </label>
            <input
              id="amount"
              type="number"
              value={state.amount}
              onChange={(e) => dispatch({ type: "SET_AMOUNT", value: e.target.value })}
              placeholder="0"
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              required
              min={1}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-zinc-300">
              Categoría
            </label>
            <select
              id="category"
              value={state.categoryId}
              onChange={(e) => dispatch({ type: "SET_CATEGORY", value: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              required
            >
              {categories.length === 0 && (
                <option value="">No hay categorías</option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
              Descripción (opcional)
            </label>
            <input
              id="description"
              type="text"
              value={state.description}
              onChange={(e) => dispatch({ type: "SET_DESCRIPTION", value: e.target.value })}
              placeholder="Descripción breve"
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              maxLength={200}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-300">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              value={state.movementDate}
              onChange={(e) => dispatch({ type: "SET_DATE", value: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              required
            />
          </div>

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={state.loading || categories.length === 0}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {state.loading ? "Registrando..." : "Registrar movimiento"}
          </button>
        </form>
      </div>
    </div>
  );
}
