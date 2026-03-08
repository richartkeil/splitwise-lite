export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          slug: string
          name: string
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          currency?: string
          created_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          group_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          group_id: string
          paid_by: string
          description: string
          amount: number
          split_among: string[]
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          paid_by: string
          description: string
          amount: number
          split_among: string[]
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          paid_by?: string
          description?: string
          amount?: number
          split_among?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      settlements: {
        Row: {
          id: string
          group_id: string
          from_member: string
          to_member: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          from_member: string
          to_member: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          from_member?: string
          to_member?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_from_member_fkey"
            columns: ["from_member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_to_member_fkey"
            columns: ["to_member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Group = Database['public']['Tables']['groups']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Settlement = Database['public']['Tables']['settlements']['Row']
