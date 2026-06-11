import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getMovementById } from "@/server/services/movement.service";
import { getActiveCategories } from "@/server/services/category.service";
import { MovementEditForm } from "@/features/movements/movement-edit-form";
import { MemberRole } from "@/generated/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar movimiento - Finver",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMovementPage({ params }: PageProps) {
  const { id } = await params;

  const [user, membership] = await Promise.all([
    requireAuth(),
    requireGroupMembership(),
  ]);

  const movement = await getMovementById(id);

  if (!movement || movement.groupId !== membership.groupId) {
    notFound();
  }

  const canEdit =
    movement.createdByUserId === user.id ||
    membership.role === MemberRole.ADMIN ||
    membership.role === MemberRole.OWNER;

  if (!canEdit) {
    redirect("/movements");
  }

  const categories = await getActiveCategories(membership.groupId);

  const movementForForm = {
    id: movement.id,
    type: movement.type as "INCOME" | "EXPENSE",
    amount: movement.amount,
    description: movement.description,
    movementDate: movement.movementDate.toISOString(),
    category: { id: movement.category.id, name: movement.category.name },
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-zinc-50">
        Editar movimiento
      </h1>
      <MovementEditForm
        movement={movementForForm}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
