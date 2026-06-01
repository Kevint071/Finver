"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  mobile?: boolean;
}

export function NavLink({ href, children, onClick, mobile }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const baseClasses = mobile
    ? "block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    : "rounded-lg px-3 py-2 text-sm font-medium transition-colors";

  const activeClasses = isActive
    ? "bg-zinc-800 text-white"
    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200";

  return (
    <Link href={href} onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      {children}
    </Link>
  );
}
