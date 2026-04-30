export function SkeletonCard() {
  return (
    <div
      className="glass rounded-[20px] overflow-hidden relative"
      style={{ aspectRatio: '3 / 4' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
      {/* Ghost info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
        <div className="h-3 rounded-full bg-white/10 w-3/4" />
        <div className="h-2.5 rounded-full bg-white/7 w-1/2" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-4 w-12 rounded-full bg-white/8" />
          <div className="h-4 w-16 rounded-full bg-white/8" />
        </div>
      </div>
    </div>
  )
}
