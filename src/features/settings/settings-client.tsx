"use client";

import { Copy, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
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
  const [inviteCode, setInviteCode] = useState(group.inviteCode);
  const [copied, setCopied] = useState(false);

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

      {/* Administrar grupos */}
      <Link
        href="/groups"
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
      >
        <Users className="h-5 w-5 text-zinc-400" />
        <div>
          <p>Administrar grupos</p>
          <p className="text-xs font-normal text-zinc-500">Ver, cambiar o eliminar tus grupos</p>
        </div>
      </Link>
    </div>
  );
}
