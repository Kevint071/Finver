"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Pencil, Check, X, Crown, Shield, Users } from "lucide-react";

interface GroupMember {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface GroupDetails {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMember[];
  currentUserRole: string;
}

interface GroupDetailPanelProps {
  groupId: string;
  currentUserId: string;
  userRole: string;
  onRenamed: (newName: string) => void;
}

export function GroupDetailPanel({
  groupId,
  currentUserId,
  userRole,
  onRenamed,
}: GroupDetailPanelProps) {
  const [details, setDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/groups/${groupId}/details`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setDetails(data);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDetails();
    return () => { cancelled = true; };
  }, [groupId]);

  async function handleCopyCode() {
    if (!details) return;
    await navigator.clipboard.writeText(details.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateCode() {
    const res = await fetch("/api/groups/invite/regenerate", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setDetails((prev) => prev ? { ...prev, inviteCode: data.inviteCode } : prev);
    }
  }

  async function handleRename() {
    if (!newName.trim()) return;
    setRenameLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setDetails((prev) => prev ? { ...prev, name: newName.trim() } : prev);
        onRenamed(newName.trim());
        setRenaming(false);
      }
    } catch {
      // silently fail
    } finally {
      setRenameLoading(false);
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3.5 w-3.5 text-amber-400" />;
      case "ADMIN":
        return <Shield className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <Users className="h-3.5 w-3.5 text-zinc-400" />;
    }
  }

  if (loading) {
    return (
      <div className="mt-3 border-t border-zinc-800/60 pt-3">
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          <span className="ml-2 text-xs text-zinc-500">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="mt-3 space-y-3 border-t border-zinc-800/60 pt-3">
      {/* Group name with rename */}
      {canManage && (
        <div className="flex items-center gap-2">
          {renaming ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                maxLength={50}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
              />
              <button
                onClick={handleRename}
                disabled={renameLoading || !newName.trim()}
                className="rounded-lg p-1.5 text-emerald-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setRenaming(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNewName(details.name);
                setRenaming(true);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Pencil className="h-3 w-3" />
              Renombrar
            </button>
          )}
        </div>
      )}

      {/* Invite Code */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-zinc-500">Código de invitación</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-mono text-zinc-200">
            {details.inviteCode}
          </code>
          <button
            onClick={handleCopyCode}
            className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
            title="Copiar"
          >
            <Copy className="h-4 w-4" />
          </button>
          {canManage && (
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

      {/* Members */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-zinc-500">
          Miembros ({details.members.length}/20)
        </p>
        <div className="space-y-1.5">
          {details.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-zinc-200 truncate">
                  {member.name || member.email}
                  {member.userId === currentUserId && (
                    <span className="ml-1.5 text-xs text-zinc-500">(tú)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {getRoleIcon(member.role)}
                <span className="text-xs text-zinc-500">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
