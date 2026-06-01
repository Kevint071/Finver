"use client";

import { ArrowDownLeft, ArrowUpRight, Menu, Plus } from "lucide-react";
import { useState } from "react";
import { AddMovementModal } from "./add-movement-modal";

interface Movement {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  movementDate: string;
  category: { id: string; name: string };
  creator: { id: string; name: string | null; image: string | null };
}

interface DashboardClientProps {
  groupName: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentMovements: Movement[];
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardClient({
  groupName,
  balance,
  totalIncome,
  totalExpense,
  monthlyIncome,
  monthlyExpense,
  recentMovements,
}: DashboardClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">{groupName}</h1>
          <a href="/settings" className="rounded-lg p-2 hover:bg-zinc-800">
            <Menu className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-400">Balance actual</p>
          <p className={`mt-1 text-3xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCOP(balance)}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-400">Ingresos mes</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {formatCOP(monthlyIncome)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-400" />
              <span className="text-xs text-zinc-400">Gastos mes</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-red-400">
              {formatCOP(monthlyExpense)}
            </p>
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Total ingresos</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">{formatCOP(totalIncome)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Total gastos</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">{formatCOP(totalExpense)}</p>
          </div>
        </div>

        {/* Recent Movements */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">Últimos movimientos</h2>
          {recentMovements.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-sm text-zinc-500">No hay movimientos aún</p>
              <p className="mt-1 text-xs text-zinc-600">
                Toca el botón + para agregar uno
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        movement.type === "INCOME"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {movement.type === "INCOME" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {movement.description || movement.category.name}
                      </p>
                      <p className="text-xs text-zinc-500">{movement.category.name}</p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      movement.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {movement.type === "INCOME" ? "+" : "-"}
                    {formatCOP(movement.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showAddModal && (
        <AddMovementModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
