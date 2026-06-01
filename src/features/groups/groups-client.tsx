"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Crown,
  Shield,
  LogOut,
  Trash2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { GroupActions } from "./group-actions";
import { GroupDetailPanel } from "./group-detail-panel";

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

function getRoleLabel(role: string) {
  switch (role) {
    case "OWNER":
      return "Propietario";
    case "ADMIN":
      return "Admin";
    default:
      return "Miembro";
  }
}

interface GroupItem {
  id: string;
  name: string;
  role: string;
  memberCount: number;
}

interface GroupsClientProps {
  groups: GroupItem[];
  activeGroupId?: string;
  currentUserId: string;
}

type ConfirmPayload = {
  type: "leave" | "delete";
  groupId: string;
  groupName: string;
};

type GroupsState = {
  showCreate: boolean;
  switching: string | null;
  leaving: string | null;
  deleting: string | null;
  expandedGroupId: string | null;
  groupNames: Record<string, string>;
  confirmAction: ConfirmPayload | null;
};

type GroupsAction =
  | { type: "TOGGLE_CREATE" }
  | { type: "SWITCH_START"; groupId: string }
  | { type: "SWITCH_DONE" }
  | { type: "LEAVE_START"; groupId: string }
  | { type: "LEAVE_DONE" }
  | { type: "DELETE_START"; groupId: string }
  | { type: "DELETE_DONE" }
  | { type: "TOGGLE_EXPAND"; groupId: string }
  | { type: "RENAME_GROUP"; groupId: string; name: string }
  | { type: "CONFIRM_ACTION"; payload: ConfirmPayload }
  | { type: "CANCEL_CONFIRM" };

const initialState: GroupsState = {
  showCreate: false,
  switching: null,
  leaving: null,
  deleting: null,
  expandedGroupId: null,
  groupNames: {},
  confirmAction: null,
};

function groupsReducer(state: GroupsState, action: GroupsAction): GroupsState {
  switch (action.type) {
    case "TOGGLE_CREATE":
      return { ...state, showCreate: !state.showCreate };
    case "SWITCH_START":
      return { ...state, switching: action.groupId };
    case "SWITCH_DONE":
      return { ...state, switching: null };
    case "LEAVE_START":
      return { ...state, leaving: action.groupId };
    case "LEAVE_DONE":
      return { ...state, leaving: null, confirmAction: null };
    case "DELETE_START":
      return { ...state, deleting: action.groupId };
    case "DELETE_DONE":
      return { ...state, deleting: null, confirmAction: null };
    case "TOGGLE_EXPAND":
      return {
        ...state,
        expandedGroupId: state.expandedGroupId === action.groupId ? null : action.groupId,
      };
    case "RENAME_GROUP":
      return { ...state, groupNames: { ...state.groupNames, [action.groupId]: action.name } };
    case "CONFIRM_ACTION":
      return { ...state, confirmAction: action.payload };
    case "CANCEL_CONFIRM":
      return { ...state, confirmAction: null };
    default:
      return state;
  }
}

// --- ConfirmationModal ---

interface ConfirmationModalProps {
  action: ConfirmPayload;
  leaving: string | null;
  deleting: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmationModal({
  action,
  leaving,
  deleting,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-950/40">
            {action.type === "delete" ? (
              <Trash2 className="size-6 text-red-400" />
            ) : (
              <LogOut className="size-6 text-red-400" />
            )}
          </div>
          <h3 className="text-base font-semibold text-zinc-100">
            {action.type === "delete" ? "Eliminar grupo" : "Abandonar grupo"}
          </h3>
          <p className="text-sm text-zinc-400">
            {action.type === "delete" ? (
              <>
                Se eliminarán todos los movimientos, categorías y miembros de{" "}
                <span className="font-medium text-zinc-200">
                  &ldquo;{action.groupName}&rdquo;
                </span>
                . Esta acción no se puede deshacer.
              </>
            ) : (
              <>
                Dejarás de tener acceso a{" "}
                <span className="font-medium text-zinc-200">
                  &ldquo;{action.groupName}&rdquo;
                </span>
                . Necesitarás una nueva invitación para volver a unirte.
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={leaving !== null || deleting !== null}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {leaving || deleting
              ? "Procesando..."
              : action.type === "delete"
              ? "Eliminar"
              : "Abandonar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- GroupCard ---

interface GroupCardProps {
  group: GroupItem;
  isActive: boolean;
  displayName: string;
  isExpanded: boolean;
  switching: string | null;
  currentUserId: string;
  onToggleExpand: () => void;
  onSwitch: () => void;
  onRename: (name: string) => void;
  onConfirmAction: (payload: ConfirmPayload) => void;
}

function GroupCard({
  group,
  isActive,
  displayName,
  isExpanded,
  switching,
  currentUserId,
  onToggleExpand,
  onSwitch,
  onRename,
  onConfirmAction,
}: GroupCardProps) {
  const isOwner = group.role === "OWNER";

  return (
    <section
      className={`rounded-xl border p-4 transition-colors ${
        isActive ? "border-emerald-800/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900/60"
      }`}
    >
      {/* Group info row */}
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer text-left"
          onClick={onToggleExpand}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isActive ? "bg-emerald-900/40" : "bg-zinc-800"
            }`}
          >
            <span className="text-sm font-bold text-zinc-300">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-100 truncate">{displayName}</p>
              {isActive && <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                {getRoleIcon(group.role)}
                <span className="text-xs text-zinc-500">{getRoleLabel(group.role)}</span>
              </div>
              <span className="text-xs text-zinc-600">·</span>
              <span className="text-xs text-zinc-500">
                {group.memberCount} miembro{group.memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {!isActive && (
            <button
              type="button"
              onClick={onSwitch}
              disabled={switching !== null}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                switching === group.id
                  ? "opacity-50"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {switching === group.id ? "..." : "Activar"}
            </button>
          )}
          <button type="button" className="cursor-pointer" onClick={onToggleExpand}>
            <ChevronDown
              className={`size-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable detail panel */}
      {isExpanded && (
        <GroupDetailPanel
          groupId={group.id}
          currentUserId={currentUserId}
          userRole={group.role}
          onRenamed={onRename}
        />
      )}

      {/* Danger action row */}
      <div className="mt-3 flex items-center justify-end border-t border-zinc-800/60 pt-3">
        {isOwner ? (
          <button
            type="button"
            onClick={() =>
              onConfirmAction({ type: "delete", groupId: group.id, groupName: displayName })
            }
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/30"
          >
            <Trash2 className="size-3.5" />
            Eliminar grupo
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onConfirmAction({ type: "leave", groupId: group.id, groupName: displayName })
            }
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/30"
          >
            <LogOut className="size-3.5" />
            Abandonar
          </button>
        )}
      </div>
    </section>
  );
}

// --- Main component ---

export function GroupsClient({
  groups,
  activeGroupId,
  currentUserId,
}: GroupsClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(groupsReducer, initialState);

  async function handleSwitch(groupId: string) {
    if (groupId === activeGroupId) return;
    dispatch({ type: "SWITCH_START", groupId });
    try {
      const res = await fetch("/api/groups/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) router.refresh();
    } catch {
      // silently fail
    }
    dispatch({ type: "SWITCH_DONE" });
  }

  async function handleLeave(groupId: string) {
    dispatch({ type: "LEAVE_START", groupId });
    try {
      const res = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al abandonar el grupo");
      }
    } catch {
      alert("Error de conexi\u00f3n");
    }
    dispatch({ type: "LEAVE_DONE" });
  }

  async function handleDelete(groupId: string) {
    dispatch({ type: "DELETE_START", groupId });
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el grupo");
      }
    } catch {
      alert("Error de conexi\u00f3n");
    }
    dispatch({ type: "DELETE_DONE" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Mis Grupos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Administra los grupos a los que perteneces
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_CREATE" })}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {/* Create/Join section */}
      {state.showCreate && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <GroupActions />
        </section>
      )}

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isActive={group.id === activeGroupId}
            displayName={state.groupNames[group.id] ?? group.name}
            isExpanded={state.expandedGroupId === group.id}
            switching={state.switching}
            currentUserId={currentUserId}
            onToggleExpand={() => dispatch({ type: "TOGGLE_EXPAND", groupId: group.id })}
            onSwitch={() => handleSwitch(group.id)}
            onRename={(name) => dispatch({ type: "RENAME_GROUP", groupId: group.id, name })}
            onConfirmAction={(payload) => dispatch({ type: "CONFIRM_ACTION", payload })}
          />
        ))}
      </div>

      {/* Confirmation modal */}
      {state.confirmAction && (
        <ConfirmationModal
          action={state.confirmAction}
          leaving={state.leaving}
          deleting={state.deleting}
          onCancel={() => dispatch({ type: "CANCEL_CONFIRM" })}
          onConfirm={() =>
            state.confirmAction!.type === "delete"
              ? handleDelete(state.confirmAction!.groupId)
              : handleLeave(state.confirmAction!.groupId)
          }
        />
      )}
    </div>
  );
}
