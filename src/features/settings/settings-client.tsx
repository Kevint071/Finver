"use client";

import { ArrowLeft, Copy, RefreshCw, LogOut } from "lucide-react";
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

  async function handleSignOut() {
    const res = await fetch("/api/auth/signout", { method: "POST" });
    if (res.ok) {
      router.push("/auth/signin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <a href="/dashboard" className="rounded-lg p-2 hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h1 className="text-lg font-semibold">Configuración</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-6">
        {/* Group Info */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400">Grupo</h2>
          <div>
            <p className="text-lg font-semibold">{group.name}</p>
            <p className="text-xs text-zinc-500">{members.length}/20 miembros</p>
          </div>
        </section>

        {/* Invite Code */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <h2 className="text-sm font-medium text-zinc-400">Código de invitación</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-mono">
              {inviteCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="rounded-lg p-2 hover:bg-zinc-800"
              title="Copiar"
            >
              <Copy className="h-4 w-4" />
            </button>
            {isOwner && (
              <button
                onClick={handleRegenerateCode}
                className="rounded-lg p-2 hover:bg-zinc-800"
                title="Regenerar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          {copied && <p className="text-xs text-emerald-400">Copiado</p>}
        </section>

        {/* Members */}
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

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </main>
    </div>
  );
}
