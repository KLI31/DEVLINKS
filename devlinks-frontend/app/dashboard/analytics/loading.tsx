export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-[300px] animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-[300px] animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>

      {/* Map skeleton */}
      <div className="h-[380px] animate-pulse rounded-xl bg-muted" />

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                    <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
                  </div>
                  <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-[300px] animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
