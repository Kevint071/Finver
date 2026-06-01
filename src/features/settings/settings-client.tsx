"use client";

import { Copy, RefreshCw, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemberRole } from "@/generated/prisma";

interface Member {
  id: string;
  role: MemberRole;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
}

interface SettingsClientProps {
  group: Group;
  members: Member[];
  currentUserId: string;
  currentRole: MemberRole;
}

export function SettingsClient({
  group,
  members,
  currentUserId,
  currentRole,
}: SettingsClientProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState(group.inviteCode);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentRole === "OWNER";

  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateCode() {
    const res = await fetch("/api/groups/invite/regenerate", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.inviteCode);
    }
  }

  async function handleDeleteGroup() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSignOut() {
    const res = await fetch("/api/auth/signout", { method: "POST" });
    if (res.ok) {
      router.push("/auth/signin");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Grupo activo - Info & Invitación */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-400">Grupo activo</h2>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {currentRole}
          </span>
        </div>

        <div>
          <p className="text-lg font-semibold">{group.name}</p>
          <p className="text-xs text-zinc-500">{members.length}/20 miembros</p>
        </div>

        {/* Invite Code */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Código de invitación</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-mono">
              {inviteCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
              title="Copiar"
            >
              <Copy className="h-4 w-4" />
            </button>
            {isOwner && (
              <button
                onClick={handleRegenerateCode}
                className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
                title="Regenerar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          {copied && <p className="text-xs text-emerald-400">Copiado</p>}
        </div>
      </section>

      {/* Miembros del grupo activo */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Miembros</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {member.user.name || member.user.email}
                  {member.user.id === currentUserId && (
                    <span className="ml-2 text-xs text-zinc-500">(tú)</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">{member.user.email}</p>
              </div>
              <span className="rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-300">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Zona peligrosa */}
      {isOwner && (
        <section className="rounded-xl border border-red-900/30 bg-red-950/10 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-medium text-red-400">Zona peligrosa</h2>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-red-900/20 bg-red-950/10 p-4 text-center">
              <p className="text-sm text-zinc-400">
                Eliminar permanentemente este grupo y todos sus datos.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto rounded-lg border border-red-900/50 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
              >
                Eliminar &ldquo;{group.name}&rdquo;
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border border-red-900/30 bg-red-950/20 p-4">
              <p className="text-sm text-zinc-300 text-center">
                ¿Estás seguro? Se eliminarán todos los movimientos, categorías y
                miembros del grupo. Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Confirmar eliminación"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Cerrar sesión */}
      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
