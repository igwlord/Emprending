interface Props {
  tags: string[]
  active: string | null
  onSelect: (tag: string | null) => void
}

export function FilterBar({ tags, active, onSelect }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto flex-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
          ${active === null
            ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white border-transparent shadow-[0_0_16px_rgba(249,115,22,0.4)]'
            : 'glass text-white/50 hover:bg-white/[0.09] hover:text-white/80 hover:border-white/20'
          }`}
      >
        Todos
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelect(active === tag ? null : tag)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
            ${active === tag
              ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white border-transparent shadow-[0_0_16px_rgba(249,115,22,0.4)]'
              : 'glass text-white/50 hover:bg-white/[0.09] hover:text-white/80 hover:border-white/20'
            }`}
        >
          {tag}
        </button>
      ))}
      <div className="w-4 shrink-0" aria-hidden="true" />
    </div>
  )
}
