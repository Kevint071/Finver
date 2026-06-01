"use client";

import { useState } from "react";
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

export function GroupsClient({
  groups,
  activeGroupId,
  currentUserId,
}: GroupsClientProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "leave" | "delete";
    groupId: string;
    groupName: string;
  } | null>(null);

  async function handleSwitch(groupId: string) {
    if (groupId === activeGroupId) return;
    setSwitching(groupId);
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
    setSwitching(null);
  }

  async function handleLeave(groupId: string) {
    setLeaving(groupId);
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
      alert("Error de conexión");
    }
    setLeaving(null);
    setConfirmAction(null);
  }

  async function handleDelete(groupId: string) {
    setDeleting(groupId);
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
      alert("Error de conexión");
    }
    setDeleting(null);
    setConfirmAction(null);
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
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {/* Create/Join section */}
      {showCreate && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <GroupActions />
        </section>
      )}

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          const isOwner = group.role === "OWNER";
          const isExpanded = expandedGroupId === group.id;
          const displayName = groupNames[group.id] || group.name;

          return (
            <section
              key={group.id}
              className={`rounded-xl border p-4 transition-colors ${
                isActive
                  ? "border-emerald-800/50 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              {/* Group info row - clickable to expand */}
              <div
                role="button"
                tabIndex={0}
                className="flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedGroupId(isExpanded ? null : group.id);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
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
                      <p className="text-sm font-medium text-zinc-100 truncate">
                        {displayName}
                      </p>
                      {isActive && (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(group.role)}
                        <span className="text-xs text-zinc-500">
                          {getRoleLabel(group.role)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">
                        {group.memberCount} miembro
                        {group.memberCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitch(group.id);
                      }}
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
                  <ChevronDown
                    className={`size-4 text-zinc-500 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expandable detail panel */}
              {isExpanded && (
                <GroupDetailPanel
                  groupId={group.id}
                  currentUserId={currentUserId}
                  userRole={group.role}
                  onRenamed={(newName) =>
                    setGroupNames((prev) => ({ ...prev, [group.id]: newName }))
                  }
                />
              )}

              {/* Danger action row */}
              <div className="mt-3 flex items-center justify-end border-t border-zinc-800/60 pt-3">
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        type: "delete",
                        groupId: group.id,
                        groupName: displayName,
                      })
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
                      setConfirmAction({
                        type: "leave",
                        groupId: group.id,
                        groupName: displayName,
                      })
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
        })}
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-950/40">
                {confirmAction.type === "delete" ? (
                  <Trash2 className="size-6 text-red-400" />
                ) : (
                  <LogOut className="size-6 text-red-400" />
                )}
              </div>
              <h3 className="text-base font-semibold text-zinc-100">
                {confirmAction.type === "delete"
                  ? "Eliminar grupo"
                  : "Abandonar grupo"}
              </h3>
              <p className="text-sm text-zinc-400">
                {confirmAction.type === "delete" ? (
                  <>
                    Se eliminarán todos los movimientos, categorías y miembros de{" "}
                    <span className="font-medium text-zinc-200">
                      &ldquo;{confirmAction.groupName}&rdquo;
                    </span>
                    . Esta acción no se puede deshacer.
                  </>
                ) : (
                  <>
                    Dejarás de tener acceso a{" "}
                    <span className="font-medium text-zinc-200">
                      &ldquo;{confirmAction.groupName}&rdquo;
                    </span>
                    . Necesitarás una nueva invitación para volver a unirte.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  confirmAction.type === "delete"
                    ? handleDelete(confirmAction.groupId)
                    : handleLeave(confirmAction.groupId)
                }
                disabled={leaving !== null || deleting !== null}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {leaving || deleting
                  ? "Procesando..."
                  : confirmAction.type === "delete"
                  ? "Eliminar"
                  : "Abandonar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
