export interface Mentor {
  id: number
  name: string
  role_company: string
  bio: string
  specialty_tags: string[]
  linkedin_url: string
  photo_url: string
  max_capacity: number
}

export interface MentorWithAvailability extends Mentor {
  booked_spots: number
  available_spots: number
  is_full: boolean
  score?: number
}

export interface Participant {
  id: string
  name: string
  startup_name: string
  email: string
  diagnostic: DiagnosticAnswers | null
  created_at: string
}

export interface Booking {
  id: string
  participant_id: string
  mentor_id: number
  topics: string[]
  notes: string | null
  created_at: string
}

export interface Feedback {
  session_label: string
  participant_name?: string
  rating: number
  comment?: string
}

export interface DiagnosticAnswers {
  stage: string
  problems: string[]
  sector: string
}

export interface RegistrationData {
  name: string
  startup_name: string
  email: string
}
