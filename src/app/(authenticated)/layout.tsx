import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/features/header/header";
import { getCurrentUserMembership } from "@/server/dal";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const membership = await getCurrentUserMembership();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        groupName={membership?.group.name ?? null}
        userName={session.user.name ?? null}
        userImage={session.user.image ?? null}
        userRole={membership?.role ?? null}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
