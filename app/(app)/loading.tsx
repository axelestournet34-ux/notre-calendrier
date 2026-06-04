export default function Loading() {
  return (
    <div className="px-4 lg:px-6 py-6 space-y-4 max-w-4xl mx-auto w-full animate-pulse">
      <div className="h-16 bg-surface-raised rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 bg-surface-raised rounded-2xl" />
        <div className="h-24 bg-surface-raised rounded-2xl" />
        <div className="h-24 bg-surface-raised rounded-2xl" />
      </div>
      <div className="h-48 bg-surface-raised rounded-2xl" />
      <div className="h-32 bg-surface-raised rounded-2xl" />
      <div className="h-32 bg-surface-raised rounded-2xl" />
    </div>
  )
}
