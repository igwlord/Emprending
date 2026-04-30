import type { DiagnosticAnswers, MentorWithAvailability } from '../types'

const STAGE_TAGS: Record<string, string[]> = {
  idea:    ['Propuesta de Valor', 'Validación de ideas', 'De idea a negocio', 'Modelos de negocio', 'Proceso 0 a 1', 'MVPs'],
  mvp:     ['Propuesta de Valor', 'Go-to-Market', 'Captación de primeros clientes', 'MVPs', 'Ventas B2B', 'Ventas B2C'],
  growth:  ['Escalar empresa', 'Estrategia de crecimiento', 'Expansión internacional', 'E-commerce', 'Métricas'],
  company: ['Procesos', 'Gestión de equipos', 'Control de Gestión', 'Recursos Humanos', 'Costos', 'Finanzas'],
}

const PROBLEM_TAGS: Record<string, string[]> = {
  sales:      ['Ventas B2B', 'Ventas B2C', 'Prospección outbound', 'Estrategia comercial', 'Marketing', 'Conseguir clientes', 'Go-to-Market'],
  financing:  ['Conseguir inversión', 'Finanzas', 'Finanzas del negocio', 'Costos', 'Legales', 'Socios'],
  team:       ['Gestión de equipos', 'Recursos Humanos', 'Cultura organizacional', 'Liderazgo', 'Procesos', 'Mejora operativa'],
  product:    ['Propuesta de Valor', 'Desarrollo de Productos', 'Desarrollo de Software', 'MVPs', 'Prototipado rápido', 'Validación de ideas'],
  legal:      ['Legales', 'Socios', 'Derecho corporativo', 'Tributario', 'Pacto societario'],
  marketing:  ['Marketing', 'Marketing Digital', 'Branding', 'Redes Sociales', 'Contenido digital', 'Meta Ads', 'Google Ads'],
  scale:      ['Expansión internacional', 'Exportación', 'Franquicias', 'Escalar empresa', 'LATAM', 'Marketplaces'],
}

const SECTOR_TAGS: Record<string, string[]> = {
  gastronomy:    ['Gastronomía', 'Restaurantes', 'Hospitalidad', 'Alimentos', 'Food & Drinks'],
  tech:          ['Tecnología', 'SaaS', 'E-commerce', 'Desarrollo de Software', 'MVPs', 'AI / Automatización'],
  services:      ['Ventas B2B', 'Consultoría', 'Servicios', 'Procesos'],
  manufacturing: ['Productos físicos', 'Procesos de fabricación', 'Prototipado', 'Costos'],
  textile:       ['Textil', 'Indumentaria', 'Moda', 'Productos físicos', 'Branding'],
  media:         ['Medios', 'Música', 'Audiovisual', 'Entretenimiento', 'Contenido digital', 'Redes Sociales', 'Branding', 'Marketing Digital'],
  other:         [],
}

export function buildNeedsFromDiagnostic(answers: DiagnosticAnswers): string[] {
  const needs = new Set<string>()
  ;(STAGE_TAGS[answers.stage] ?? []).forEach(t => needs.add(t))
  ;(answers.problems ?? []).forEach(p => {
    ;(PROBLEM_TAGS[p] ?? []).forEach(t => needs.add(t))
  })
  ;(SECTOR_TAGS[answers.sector] ?? []).forEach(t => needs.add(t))
  return Array.from(needs)
}

export function scoreMentors(
  mentors: MentorWithAvailability[],
  answers: DiagnosticAnswers,
): MentorWithAvailability[] {
  const needs = buildNeedsFromDiagnostic(answers)

  const scored = mentors.map(m => ({
    ...m,
    score: m.specialty_tags.filter(tag =>
      needs.some(need => tag.toLowerCase().includes(need.toLowerCase()) || need.toLowerCase().includes(tag.toLowerCase()))
    ).length,
  }))

  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}
