import { NavLink } from "./nav-link";
import { MobileNav } from "./mobile-nav";
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
  { href: "/categories", label: "Categorías" },
  { href: "/groups", label: "Grupos" },
];

export function Header({ groupName, userName, userImage }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <a href="/dashboard" className="text-lg font-semibold text-zinc-50 hover:text-white">
          {groupName ?? "Finver"}
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <AvatarMenu
            userName={userName}
            userImage={userImage}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        </nav>

        {/* Mobile navigation */}
        <MobileNav
          navLinks={navLinks}
          userName={userName}
          userImage={userImage}
          signOutAction={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        />
      </div>
    </header>
  );
}
