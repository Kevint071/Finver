"use client";

import { useReducer } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, RefreshCw, Pencil, Check, X, Crown, Shield, Users } from "lucide-react";

function getRoleIcon(role: string) {
  switch (role) {
    case "OWNER":
      return <Crown className="size-3.5 text-amber-400" />;
    case "ADMIN":
      return <Shield className="size-3.5 text-blue-400" />;
    default:
      return <Users className="size-3.5 text-zinc-400" />;
  }
}

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

type PanelState = {
  copied: boolean;
  renaming: boolean;
  newName: string;
  renameLoading: boolean;
  inviteCode: string | null;
};

type PanelAction =
  | { type: "COPY_START" }
  | { type: "COPY_RESET" }
  | { type: "RENAME_START"; currentName: string }
  | { type: "RENAME_CANCEL" }
  | { type: "RENAME_NAME_CHANGE"; name: string }
  | { type: "RENAME_SUBMIT" }
  | { type: "RENAME_DONE" }
  | { type: "INVITE_CODE_UPDATED"; code: string };

const initialPanelState: PanelState = {
  copied: false,
  renaming: false,
  newName: "",
  renameLoading: false,
  inviteCode: null,
};

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case "COPY_START":
      return { ...state, copied: true };
    case "COPY_RESET":
      return { ...state, copied: false };
    case "RENAME_START":
      return { ...state, renaming: true, newName: action.currentName };
    case "RENAME_CANCEL":
      return { ...state, renaming: false };
    case "RENAME_NAME_CHANGE":
      return { ...state, newName: action.name };
    case "RENAME_SUBMIT":
      return { ...state, renameLoading: true };
    case "RENAME_DONE":
      return { ...state, renaming: false, renameLoading: false };
    case "INVITE_CODE_UPDATED":
      return { ...state, inviteCode: action.code };
    default:
      return state;
  }
}

export function GroupDetailPanel({
  groupId,
  currentUserId,
  userRole,
  onRenamed,
}: GroupDetailPanelProps) {
  const [state, dispatch] = useReducer(panelReducer, initialPanelState);

  const { data: details, isLoading } = useQuery<GroupDetails>({
    queryKey: ["group-details", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/details`);
      if (!res.ok) throw new Error("Failed to fetch group details");
      return res.json();
    },
  });

  const canManage = userRole === "OWNER" || userRole === "ADMIN";
  const inviteCode = state.inviteCode ?? details?.inviteCode ?? "";

  async function handleCopyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    dispatch({ type: "COPY_START" });
    setTimeout(() => dispatch({ type: "COPY_RESET" }), 2000);
  }

  async function handleRegenerateCode() {
    const res = await fetch("/api/groups/invite/regenerate", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      dispatch({ type: "INVITE_CODE_UPDATED", code: data.inviteCode });
    }
  }

  async function handleRename() {
    if (!state.newName.trim()) return;
    dispatch({ type: "RENAME_SUBMIT" });
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.newName.trim() }),
      });
      if (res.ok) {
        onRenamed(state.newName.trim());
        dispatch({ type: "RENAME_DONE" });
      } else {
        dispatch({ type: "RENAME_DONE" });
      }
    } catch {
      dispatch({ type: "RENAME_DONE" });
    }
  }

  if (isLoading) {
    return (
      <div className="mt-3 border-t border-zinc-800/60 pt-3">
        <div className="flex items-center justify-center py-4">
          <div className="size-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          <span className="ml-2 text-xs text-zinc-500">Cargando…</span>
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
          {state.renaming ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={state.newName}
                onChange={(e) =>
                  dispatch({ type: "RENAME_NAME_CHANGE", name: e.target.value })
                }
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                maxLength={50}
                aria-label="Nuevo nombre del grupo"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") dispatch({ type: "RENAME_CANCEL" });
                }}
              />
              <button
                type="button"
                onClick={handleRename}
                disabled={state.renameLoading || !state.newName.trim()}
                className="rounded-lg p-1.5 text-emerald-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "RENAME_CANCEL" })}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "RENAME_START", currentName: details.name })
              }
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Pencil className="size-3" />
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
            {inviteCode}
          </code>
          <button
            type="button"
            onClick={handleCopyCode}
            className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
            title="Copiar"
          >
            <Copy className="size-4" />
          </button>
          {canManage && (
            <button
              type="button"
              onClick={handleRegenerateCode}
              className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
              title="Regenerar"
            >
              <RefreshCw className="size-4" />
            </button>
          )}
        </div>
        {state.copied && <p className="text-xs text-emerald-400">Copiado</p>}
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
