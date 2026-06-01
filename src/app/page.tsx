import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-lg font-semibold text-zinc-50">Finver</span>
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Ir al dashboard →
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Finanzas familiares,{" "}
            <span className="text-emerald-400">simplificadas</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
            Controla los ingresos y gastos de tu grupo familiar en un solo lugar.
            Simple, rápido y colaborativo.
          </p>
          <div className="mt-8">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/25"
              >
                Ir al dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/25"
              >
                Comenzar gratis
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="📊"
            title="Control total"
            description="Registra ingresos y gastos con categorías personalizadas."
          />
          <FeatureCard
            icon="👥"
            title="Colaborativo"
            description="Invita a tu familia y gestionen juntos sus finanzas."
          />
          <FeatureCard
            icon="📱"
            title="Siempre disponible"
            description="Instala la app en tu celular y accede desde cualquier lugar."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-4 py-6 text-center">
        <p className="text-sm text-zinc-500">
          Finver © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 text-sm font-semibold text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </div>
  );
}
