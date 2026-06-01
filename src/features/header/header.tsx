import { NavLink } from "./nav-link";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  groupName: string;
  userName: string | null;
  userImage: string | null;
  userRole: string;
}

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/categories", label: "Categorías" },
  { href: "/settings", label: "Ajustes" },
];

export function Header({ groupName, userName, userImage }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <a href="/" className="text-lg font-semibold text-zinc-50 hover:text-white">
          {groupName}
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <div className="ml-3 flex items-center">
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
          </div>
        </nav>

        {/* Mobile navigation */}
        <MobileNav
          navLinks={navLinks}
          userName={userName}
          userImage={userImage}
        />
      </div>
    </header>
  );
}
