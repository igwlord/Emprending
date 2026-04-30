const TAG_COLORS: Record<string, string> = {
  'Ventas': 'bg-orange-500/20 text-orange-200 border-orange-500/25',
  'Marketing': 'bg-pink-500/20 text-pink-200 border-pink-500/25',
  'Finanzas': 'bg-emerald-500/20 text-emerald-200 border-emerald-500/25',
  'Legales': 'bg-blue-500/20 text-blue-200 border-blue-500/25',
  'Tecnología': 'bg-violet-500/20 text-violet-200 border-violet-500/25',
  'Procesos': 'bg-yellow-500/20 text-yellow-200 border-yellow-500/25',
  'Triple impacto': 'bg-teal-500/20 text-teal-200 border-teal-500/25',
  'Gastronomía': 'bg-red-500/20 text-red-200 border-red-500/25',
  'Productos físicos': 'bg-amber-500/20 text-amber-200 border-amber-500/25',
  'E-commerce': 'bg-cyan-500/20 text-cyan-200 border-cyan-500/25',
  'AI': 'bg-purple-500/20 text-purple-200 border-purple-500/25',
  'default': 'bg-white/10 text-white/70 border-white/15',
}

function getTagColor(tag: string): string {
  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) return color
  }
  return TAG_COLORS.default
}

interface Props {
  tag: string
}

export function TagBadge({ tag }: Props) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide whitespace-nowrap ${getTagColor(tag)}`}>
      {tag}
    </span>
  )
}
