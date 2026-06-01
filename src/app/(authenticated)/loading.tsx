export default function AuthenticatedLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800 hidden md:block" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800 hidden md:block" />
            <div className="size-8 animate-pulse rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
        </div>
      </main>
    </div>
  );
}
