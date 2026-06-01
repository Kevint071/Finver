"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "./nav-link";

interface MobileNavProps {
  navLinks: { href: string; label: string }[];
  userName: string | null;
  userImage: string | null;
}

export function MobileNav({ navLinks, userName, userImage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 hover:bg-zinc-800"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-zinc-800 bg-zinc-950 px-4 py-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                mobile
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-zinc-800 pt-3">
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
            <span className="text-sm text-zinc-300">{userName ?? "Usuario"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
