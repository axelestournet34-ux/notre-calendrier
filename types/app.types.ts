import type { Database } from './database.types'

// ─── Raccourcis de types de base ───
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Couple = Database['public']['Tables']['couples']['Row']
export type CoupleMember = Database['public']['Tables']['couple_members']['Row']
export type CoupleInvitation = Database['public']['Tables']['couple_invitations']['Row']
export type Memory = Database['public']['Tables']['memories']['Row']
export type MemoryPhoto = Database['public']['Tables']['memory_photos']['Row']
export type MonthlyCover = Database['public']['Tables']['monthly_covers']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type ImportantDate = Database['public']['Tables']['important_dates']['Row']
export type BucketListItem = Database['public']['Tables']['bucket_list_items']['Row']
export type TimeCapsule = Database['public']['Tables']['time_capsules']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// ─── Types enrichis (avec relations) ───
export type MemoryWithPhotos = Memory & {
  memory_photos: MemoryPhoto[]
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  reactions: Reaction[]
  comments: (Comment & {
    profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  })[]
}

export type CoupleWithMembers = Couple & {
  couple_members: (CoupleMember & {
    profiles: Profile
  })[]
}

// ─── Types utilitaires ───
export type MonthYear = {
  year: number
  month: number
}

export type DayMemories = {
  date: string
  memories: MemoryWithPhotos[]
}

export type ReactionCounts = Record<string, number>

export type ActivityItem = ActivityLog & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ─── Thème ───
export type Theme = 'clair' | 'sombre' | 'systeme'

// ─── États de formulaire ───
export type FormState = {
  error?: string
  success?: string
}
