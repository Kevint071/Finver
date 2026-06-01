"use client";

import { LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AvatarMenuProps {
  userName: string | null;
  userImage: string | null;
  signOutAction: () => Promise<void>;
}

export function AvatarMenu({ userName, userImage, signOutAction }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative ml-3" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        {userImage ? (
          <img
            src={userImage}
            alt={userName ?? "Usuario"}
            className="h-8 w-8 rounded-full border border-zinc-700"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
            {userName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
          <div className="border-b border-zinc-800 px-3 py-2">
            <p className="truncate text-sm font-medium text-zinc-200">
              {userName ?? "Usuario"}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
