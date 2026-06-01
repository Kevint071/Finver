"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GroupActions() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  return (
    <div className="w-full space-y-4">
      {mode === "choose" && (
        <div className="space-y-3">
          <button
            onClick={() => setMode("create")}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Crear grupo
          </button>
          <button
            onClick={() => setMode("join")}
            className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            Unirme con código
          </button>
        </div>
      )}

      {mode === "create" && <CreateGroupForm onBack={() => setMode("choose")} />}
      {mode === "join" && <JoinGroupForm onBack={() => setMode("choose")} />}
    </div>
  );
}

function CreateGroupForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear el grupo");
        return;
      }

      setName("");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="group-name" className="block text-sm font-medium text-zinc-300">
          Nombre del grupo
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mi familia"
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          required
          maxLength={50}
        />
      </div>
      <div className="min-h-5">
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear"}
        </button>
      </div>
    </form>
  );
}

function JoinGroupForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al unirse");
        return;
      }

      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="invite-code" className="block text-sm font-medium text-zinc-300">
          Código de invitación
        </label>
        <input
          id="invite-code"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="ABC12345"
          className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          required
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Uniéndose..." : "Unirme"}
        </button>
      </div>
    </form>
  );
}
