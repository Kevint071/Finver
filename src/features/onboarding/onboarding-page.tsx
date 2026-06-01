"use client";

import { GroupActions } from "@/features/groups/group-actions";

export function OnboardingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bienvenido a Finver</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Para comenzar, crea un grupo familiar o únete a uno existente.
          </p>
        </div>
        <GroupActions />
      </div>
    </div>
  );
}
