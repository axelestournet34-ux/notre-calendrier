export function PageSkeleton({
  lines = 4,
  grid = false,
}: {
  lines?: number
  grid?: boolean
}) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-border px-4 lg:px-6 h-14 flex items-center gap-3">
        <div className="h-4 w-36 bg-surface-raised rounded" />
        <div className="h-3 w-24 bg-surface-raised rounded ml-1 opacity-60" />
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto w-full">
        {grid ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-raised rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-raised rounded-2xl"
                style={{ height: i === 0 ? '7rem' : '5rem', opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
