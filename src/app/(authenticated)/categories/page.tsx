import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveCategories } from "@/server/services/category.service";
import { CategoriesClient } from "@/features/categories/categories-client";
import { getCurrentUserMembership } from "@/server/dal";
import { NoGroupState } from "@/features/groups/no-group-state";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const membership = await getCurrentUserMembership();

  if (!membership) {
    return (
      <NoGroupState
        title="Sin grupo"
        description="Necesitas pertenecer a un grupo para ver y gestionar categorías. Crea un grupo o únete a uno existente."
      />
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
