import { MessageSquare } from 'lucide-react'
import type { MentorWithAvailability } from '../types'
import { TagBadge } from './TagBadge'

interface Props {
  mentor: MentorWithAvailability
  isRecommended?: boolean
  sessionDone?: boolean
  hasNotes?: boolean
  index?: number
  onOpenModal: (mentor: MentorWithAvailability) => void
}

export function MentorCard({ mentor, isRecommended, sessionDone, hasNotes, index = 0, onOpenModal }: Props) {
  const delay = Math.min(index * 25, 280)

  return (
    <div
      onClick={() => onOpenModal(mentor)}
      className="relative rounded-[20px] overflow-hidden cursor-pointer select-none glass
        transition-[transform,box-shadow,border-color] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:scale-[1.04] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20"
      style={{
        aspectRatio: '3 / 4',
        animationName: 'fade-up',
        animationDuration: '350ms',
        animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
        animationFillMode: 'both',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Atmospheric blur fill */}
      <img
        src={mentor.photo_url}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-125"
        style={{ filter: 'blur(30px)', opacity: 0.55 }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main photo — scale-[1.15] clips white margins from any source photo */}
      <img
        src={mentor.photo_url}
        alt={mentor.name}
        className="absolute inset-0 w-full h-full object-cover object-[center_25%] scale-[1.3]"
        onError={e => {
          const t = e.currentTarget
          t.style.display = 'none'
          const blur = t.previousElementSibling?.previousElementSibling as HTMLImageElement | null
          if (blur) blur.style.display = 'none'
          const fallback = document.createElement('div')
          fallback.className = 'absolute inset-0 flex items-center justify-center text-5xl font-black text-[#f97316] bg-[#0e0e1c]'
          fallback.textContent = mentor.name.charAt(0)
          t.parentElement!.appendChild(fallback)
        }}
      />

      {/* Edge vignette — blends any light/white photo background */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ boxShadow: 'inset 0 0 60px 20px rgba(0,0,0,0.55)' }}
      />
      {/* Top gradient — extra darkening for photos with light/white top areas */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-[1]" />

      {/* Bottom gradient — for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/98 via-black/75 to-transparent z-[2]" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-[3]">
        <div className="flex flex-col gap-1">
          {isRecommended && (
            <span className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase shadow-[0_0_10px_rgba(249,115,22,0.5)]">
              ★ Top
            </span>
          )}
          {sessionDone && (
            <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
              ✓ Sesión
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasNotes && (
            <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare size={11} className="text-[#f97316]" />
            </div>
          )}
          {mentor.linkedin_url && (
            <a
              href={mentor.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{ background: 'rgba(10,102,194,0.18)', border: '1px solid rgba(10,102,194,0.35)' }}
              onClick={e => e.stopPropagation()}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-[3]">
        <h3 className="font-bold text-white text-[14px] leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {mentor.name}
        </h3>
        <p className="text-white/55 text-[10px] mt-0.5 line-clamp-1 leading-tight">{mentor.role_company}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {mentor.specialty_tags[0] && <TagBadge tag={mentor.specialty_tags[0]} />}
          {mentor.specialty_tags[1] && <TagBadge tag={mentor.specialty_tags[1]} />}
        </div>
      </div>
    </div>
  )
}
