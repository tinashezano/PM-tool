import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Construction size={22} />
      </div>
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <p className="max-w-sm text-sm text-muted">
        This area isn&rsquo;t built yet. The Deals pipeline is the first working
        screen &mdash; everything else in the sidebar is scaffolded for what
        comes next.
      </p>
    </div>
  );
}
