import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
}

export function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex gap-3 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={40}
            className={`transition-colors ${star <= value ? 'text-[#f97316] fill-[#f97316]' : 'text-[#2a2a4a]'}`}
          />
        </button>
      ))}
    </div>
  )
}
