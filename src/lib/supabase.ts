import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 클라이언트 사이드용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 서버 사이드용 Supabase 클라이언트 (Service Role Key 사용)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          kakao_id: string | null
          name: string
          profile_image: string | null
          email: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kakao_id?: string | null
          name: string
          profile_image?: string | null
          email?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kakao_id?: string | null
          name?: string
          profile_image?: string | null
          email?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string | null
          date: string
          location: string
          max_attendees: number | null
          fee: number
          status: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED'
          invite_code: string
          kakao_pay_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description?: string | null
          date: string
          location: string
          max_attendees?: number | null
          fee?: number
          status?: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED'
          invite_code: string
          kakao_pay_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string
          max_attendees?: number | null
          fee?: number
          status?: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED'
          invite_code?: string
          kakao_pay_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_members: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          guest_name: string | null
          status: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING'
          has_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          guest_name?: string | null
          status?: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING'
          has_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          guest_name?: string | null
          status?: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING'
          has_paid?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          event_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      carpools: {
        Row: {
          id: string
          event_id: string
          driver_id: string
          seats: number
          departure: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          driver_id: string
          seats: number
          departure: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          driver_id?: string
          seats?: number
          departure?: string
          created_at?: string
          updated_at?: string
        }
      }
      carpool_requests: {
        Row: {
          id: string
          carpool_id: string
          user_id: string
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carpool_id: string
          user_id: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carpool_id?: string
          user_id?: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: {}
  }
}
