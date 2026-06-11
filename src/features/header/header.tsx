import Link from "next/link";
import { NavLink } from "./nav-link";
import { AvatarMenu } from "./avatar-menu";
import { signOut } from "@/lib/auth";

interface HeaderProps {
  groupName: string | null;
  userName: string | null;
  userImage: string | null;
  userRole: string | null;
}

const navLinks = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/movements", label: "Movimientos" },
  { href: "/categories", label: "Categorías" },
  { href: "/activity", label: "Actividad" },
  { href: "/groups", label: "Grupos" },
];

export function Header({ groupName, userName, userImage }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="text-lg font-semibold text-zinc-50 hover:text-white shrink-0">
          {groupName ?? "Finver"}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <div className="ml-2 h-5 w-px bg-zinc-700" aria-hidden />
          <AvatarMenu
            userName={userName}
            userImage={userImage}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        </nav>

        {/* Mobile avatar menu */}
        <div className="md:hidden">
          <AvatarMenu
            userName={userName}
            userImage={userImage}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        </div>
      </div>
    </header>
  );
}
