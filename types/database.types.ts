export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      couples: {
        Row: {
          id: string
          name: string
          start_date: string | null
          cover_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          start_date?: string | null
          cover_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          start_date?: string | null
          cover_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      couple_members: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'member'
        }
        Relationships: [
          {
            foreignKeyName: 'couple_members_couple_id_fkey'
            columns: ['couple_id']
            referencedRelation: 'couples'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'couple_members_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      couple_invitations: {
        Row: {
          id: string
          couple_id: string
          invited_by: string
          token: string
          email: string | null
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          invited_by: string
          token?: string
          email?: string | null
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          date: string
          title: string
          note: string | null
          type: MemoryType
          lieu: string | null
          citation: string | null
          chanson_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          date: string
          title: string
          note?: string | null
          type?: MemoryType
          lieu?: string | null
          citation?: string | null
          chanson_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          date?: string
          title?: string
          note?: string | null
          type?: MemoryType
          lieu?: string | null
          citation?: string | null
          chanson_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memories_couple_id_fkey'
            columns: ['couple_id']
            referencedRelation: 'couples'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'memories_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      memory_photos: {
        Row: {
          id: string
          memory_id: string
          storage_path: string
          caption: string | null
          sort_order: number
          media_type: 'photo' | 'video' | 'audio'
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          storage_path: string
          caption?: string | null
          sort_order?: number
          media_type?: 'photo' | 'video' | 'audio'
          created_at?: string
        }
        Update: {
          caption?: string | null
          sort_order?: number
          media_type?: 'photo' | 'video' | 'audio'
        }
        Relationships: [
          {
            foreignKeyName: 'memory_photos_memory_id_fkey'
            columns: ['memory_id']
            referencedRelation: 'memories'
            referencedColumns: ['id']
          }
        ]
      }
      monthly_covers: {
        Row: {
          id: string
          couple_id: string
          year: number
          month: number
          photo_id: string | null
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          year: number
          month: number
          photo_id?: string | null
          storage_path?: string | null
          created_at?: string
        }
        Update: {
          photo_id?: string | null
          storage_path?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          user_id: string
          type: ReactionType
          created_at?: string
        }
        Update: {
          type?: ReactionType
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          id: string
          couple_id: string
          title: string
          date: string
          type: ImportantDateType
          recurrent: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          title: string
          date: string
          type?: ImportantDateType
          recurrent?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          date?: string
          type?: ImportantDateType
          recurrent?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      bucket_list_items: {
        Row: {
          id: string
          couple_id: string
          created_by: string
          title: string
          description: string | null
          status: BucketStatus
          planned_date: string | null
          memory_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          created_by: string
          title: string
          description?: string | null
          status?: BucketStatus
          planned_date?: string | null
          memory_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: BucketStatus
          planned_date?: string | null
          memory_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      time_capsules: {
        Row: {
          id: string
          couple_id: string
          created_by: string
          title: string
          content: string
          open_date: string
          opened_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          created_by: string
          title: string
          content: string
          open_date: string
          opened_at?: string | null
          created_at?: string
        }
        Update: {
          opened_at?: string | null
        }
        Relationships: []
      }
      mots_amour: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: { content?: string }
        Relationships: []
      }
      mots_amour_photos: {
        Row: {
          id: string
          mot_id: string
          storage_path: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          mot_id: string
          storage_path: string
          sort_order?: number
          created_at?: string
        }
        Update: { sort_order?: number }
        Relationships: []
      }
      daily_messages: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          content: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          content: string
          date?: string
          created_at?: string
        }
        Update: { content?: string }
        Relationships: []
      }
      daily_moods: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          mood: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          mood: string
          date?: string
          created_at?: string
        }
        Update: { mood?: string }
        Relationships: []
      }
      lettres: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          title: string
          content: string
          created_at?: string
        }
        Update: { title?: string; content?: string }
        Relationships: []
      }
      liste_courses: {
        Row: {
          id: string
          couple_id: string
          content: string
          done: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          content: string
          done?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          content?: string
          done?: boolean
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          created_at?: string
        }
        Update: {
          action?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          couple_id: string
          recipient_id: string
          actor_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          recipient_id: string
          actor_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          couple_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          couple_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          endpoint?: string
          p256dh?: string
          auth?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      daily_question_answers: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          answer: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          answer: string
          date?: string
          created_at?: string
        }
        Update: {
          answer?: string
        }
        Relationships: []
      }
      tmc_questions: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          question: string
          options: string[]
          correct_index: number
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          question: string
          options: string[]
          correct_index: number
          created_at?: string
        }
        Update: {
          question?: string
          options?: string[]
          correct_index?: number
        }
        Relationships: []
      }
      tmc_answers: {
        Row: {
          id: string
          question_id: string
          user_id: string
          chosen_index: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          chosen_index: number
          created_at?: string
        }
        Update: {
          chosen_index?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      memory_type: MemoryType
      reaction_type: ReactionType
      important_date_type: ImportantDateType
      bucket_status: BucketStatus
    }
    CompositeTypes: Record<string, never>
  }
}

export type MemoryType =
  | 'sortie'
  | 'voyage'
  | 'repas'
  | 'anniversaire'
  | 'quotidien'
  | 'premiere_fois'
  | 'autre'

export type ReactionType = 'coeur' | 'rire' | 'etoile' | 'nostalgie'

export type ImportantDateType =
  | 'anniversaire'
  | 'premiere_rencontre'
  | 'voyage'
  | 'personnalise'

export type BucketStatus = 'a_faire' | 'en_cours' | 'realise'
