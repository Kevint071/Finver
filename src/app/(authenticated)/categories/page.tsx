import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveCategories } from "@/server/services/category.service";
import { CategoriesClient } from "@/features/categories/categories-client";
import { getCurrentUserMembership } from "@/server/dal";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorías - Finver",
  description: "Gestión de categorías de movimientos",
};

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const membership = await getCurrentUserMembership();

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-bold">Sin grupo</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Necesitas pertenecer a un grupo para ver y gestionar categorías.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          Ir a inicio
        </Link>
      </div>
    );
  }

  const categories = await getActiveCategories(membership.groupId);

  return (
    <CategoriesClient
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        isActive: c.isActive,
      }))}
      userRole={membership.role}
    />
  );
}
