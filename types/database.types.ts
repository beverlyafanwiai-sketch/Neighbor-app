export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          avatar_url: string | null;
          tagline: string | null;
          interests: string | null;
          values: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          avatar_url?: string | null;
          tagline?: string | null;
          interests?: string | null;
          values?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          avatar_url?: string | null;
          tagline?: string | null;
          interests?: string | null;
          values?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          created_at: string;
          author_id: string;
          body: string;
          loves: number;
          replies: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          author_id: string;
          body: string;
          loves?: number;
          replies?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          author_id?: string;
          body?: string;
          loves?: number;
          replies?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
