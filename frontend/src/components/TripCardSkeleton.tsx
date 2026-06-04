function SkeletonLine({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ''}`} />
}

export default function TripCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border bg-white p-6 pb-4.5">
      <div
        className="grid items-center gap-6"
        style={{ gridTemplateColumns: 'auto 1fr auto 1fr auto' }}
      >
        {/* Departure */}
        <div className="space-y-3">
          <SkeletonLine className="h-8 w-16" />
          <SkeletonLine className="h-4 w-24" />
        </div>

        {/* Duration */}
        <div className="flex flex-col items-center gap-2">
          <SkeletonLine className="h-3.5 w-16" />
          <SkeletonLine className="h-px w-full" />
          <SkeletonLine className="h-3 w-10" />
        </div>

        {/* Arrival */}
        <div className="space-y-3">
          <SkeletonLine className="h-8 w-16" />
          <SkeletonLine className="h-4 w-28" />
        </div>

        {/* Spacer */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-8 w-px bg-slate-100" />
        </div>

        {/* Price + action */}
        <div className="flex flex-col items-end gap-4">
          <SkeletonLine className="h-8 w-24" />
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-10 w-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-dashed border-slate-100 pt-3.5">
        <SkeletonLine className="h-4 w-28" />
      </div>
    </div>
  )
}
