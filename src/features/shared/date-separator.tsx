interface DateSeparatorProps {
  date: Date;
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="relative flex items-center py-4">
      <div className="flex-1 border-t border-zinc-800" />
      <span className="mx-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
        {formatDateLabel(date)}
      </span>
      <div className="flex-1 border-t border-zinc-800" />
    </div>
  );
}
