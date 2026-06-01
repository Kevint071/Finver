"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface GroupItem {
  id: string;
  name: string;
  role: string;
  memberCount: number;
}

interface GroupListProps {
  groups: GroupItem[];
  activeGroupId: string | null;
}

export function GroupList({ groups, activeGroupId }: GroupListProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  async function handleSwitch(groupId: string) {
    if (groupId === activeGroupId) return;
    setSwitching(groupId);

    try {
      const res = await fetch("/api/groups/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isActive = group.id === activeGroupId;
        return (
          <button
            key={group.id}
            onClick={() => handleSwitch(group.id)}
            disabled={switching !== null}
            className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
              isActive
                ? "border border-white/20 bg-zinc-800"
                : "border border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800"
            } ${switching === group.id ? "opacity-50" : ""}`}
          >
            <div>
              <p className="text-sm font-medium">
                {group.name}
                {isActive && (
                  <span className="ml-2 rounded-md bg-emerald-900/50 px-1.5 py-0.5 text-xs text-emerald-400">
                    Activo
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500">
                {group.role} · {group.memberCount} miembro{group.memberCount !== 1 ? "s" : ""}
              </p>
            </div>
            {!isActive && (
              <span className="text-xs text-zinc-500">Cambiar</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
