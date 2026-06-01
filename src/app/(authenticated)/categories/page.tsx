import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getActiveCategories } from "@/server/services/category.service";
import { CategoriesClient } from "@/features/categories/categories-client";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const membership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: true },
  });

  if (!membership) redirect("/");

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
