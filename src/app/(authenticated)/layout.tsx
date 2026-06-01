import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/features/header/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const membership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        groupName={membership?.group.name ?? "Finver"}
        userName={session.user.name ?? null}
        userImage={session.user.image ?? null}
        userRole={membership?.role ?? "MEMBER"}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
