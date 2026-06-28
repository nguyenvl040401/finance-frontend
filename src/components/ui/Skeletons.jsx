// src/components/ui/Skeletons.jsx

function Bar({ className = "" }) {
  return (
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Bar className="w-20 h-3" />
          <Bar className="h-6 w-28" />
        </div>
        <Bar className="w-24 h-9 rounded-xl" />
      </div>
      {/* Hero card */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-4">
        <Bar className="w-24 h-3" />
        <Bar className="w-40 h-10" />
        <Bar className="h-1.5 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          <Bar className="h-16 rounded-xl" />
          <Bar className="h-16 rounded-xl" />
        </div>
      </div>
      {/* Budget bars */}
      <div className="space-y-4 card">
        <Bar className="w-32 h-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Bar className="w-24 h-3" />
              <Bar className="w-8 h-3" />
            </div>
            <Bar className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      {/* Quick add */}
      <div className="space-y-3 card">
        <Bar className="w-20 h-3" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Bar key={i} className="h-16 w-[58px] rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Transactions ─────────────────────────────────────────────────────────────
export function TransactionsSkeleton() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Bar className="w-32 h-7" />
        <Bar className="h-9 w-9 rounded-xl" />
      </div>
      <Bar className="w-full h-10 rounded-xl" />
      <div className="flex gap-2">
        <Bar className="flex-1 h-9 rounded-xl" />
        <Bar className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Bar className="h-14 rounded-xl" />
        <Bar className="h-14 rounded-xl" />
      </div>
      {[...Array(2)].map((_, g) => (
        <div key={g} className="space-y-1">
          <Bar className="w-24 h-3 ml-1" />
          <div className="card p-0 overflow-hidden divide-y divide-white/[0.04]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Bar className="flex-shrink-0 w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Bar className="w-2/5 h-3" />
                  <Bar className="h-2.5 w-1/4" />
                </div>
                <Bar className="w-20 h-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
export function CategoriesSkeleton() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Bar className="h-7 w-28" />
        <Bar className="h-9 w-9 rounded-xl" />
      </div>
      <Bar className="w-full h-10 rounded-xl" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 card">
            <Bar className="flex-shrink-0 h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Bar className="w-1/3 h-3" />
              <Bar className="h-2.5 w-1/2" />
            </div>
            <Bar className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
export function ReportsSkeleton() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Bar className="w-32 h-3" />
          <Bar className="w-24 h-7" />
        </div>
        <Bar className="w-20 h-9 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <Bar key={i} className="h-14 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 card">
        <Bar className="w-20 h-3" />
        <div className="flex items-end gap-1.5 h-[200px]">
          {[...Array(12)].map((_, i) => (
            <Bar
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${25 + ((i * 17) % 70)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
