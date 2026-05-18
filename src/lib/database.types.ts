/**
 * Database types for the Benki Supabase schema.
 *
 * Hand-written to match supabase/migrations/*_initial_schema.sql. Once the
 * project is linked, regenerate the authoritative version with:
 *
 *   supabase gen types typescript --linked > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          avatar_url: string | null;
          xp: number;
          league: string; // generated column — read-only
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          avatar_url?: string | null;
          xp?: number;
        };
        Update: {
          name?: string;
          email?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          due_at: string;
          xp: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          due_at: string;
          xp?: number;
          completed_at?: string | null;
        };
        Update: {
          title?: string;
          notes?: string | null;
          due_at?: string;
          xp?: number;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      friend_requests: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          status?: 'pending' | 'accepted' | 'declined';
        };
        Update: {
          status?: 'pending' | 'accepted' | 'declined';
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          friend_id: string;
        };
        Update: {
          user_id?: string;
          friend_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      accept_friend_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      get_leaderboard: {
        Args: { p_range: string };
        Returns: {
          id: string;
          name: string;
          avatar_url: string | null;
          xp: number;
          rank: number;
          is_me: boolean;
        }[];
      };
      search_profiles: {
        Args: { p_query: string };
        Returns: {
          id: string;
          name: string;
          avatar_url: string | null;
          xp: number;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
