/**
 * Supabase Database type definitions.
 *
 * These mirror the tables in supabase/schema.sql.
 * When you run `supabase gen types typescript` after setting up your project,
 * paste the output here to get full end-to-end type safety.
 *
 * Until then, these manual types keep the codebase compilable and give you
 * autocomplete on all Supabase queries.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'consultant' | 'client';
          display_name: string | null;
          avatar_url: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      service_packages: {
        Row: {
          id: string;
          name: string;
          tier: 'starter' | 'growth' | 'enterprise' | 'custom';
          description: string;
          features: string[];
          price_usd: number | null;
          pricing_label: string | null;
          phases: string[];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_packages']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['service_packages']['Insert']>;
      };

      service_requests: {
        Row: {
          id: string;
          package_id: string | null;
          package_name: string | null;
          status: 'pending' | 'reviewing' | 'accepted' | 'declined' | 'converted';
          business_name: string;
          industry: string;
          contact_name: string;
          contact_email: string;
          phone: string | null;
          website: string | null;
          message: string | null;
          client_id: string | null;
          consultant_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_requests']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['service_requests']['Insert']>;
      };

      messages: {
        Row: {
          id: string;
          client_id: string;
          sender_user_id: string;
          sender_role: 'consultant' | 'client';
          sender_name: string;
          body: string;
          read_by_consultant: boolean;
          read_by_client: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };

      task_comments: {
        Row: {
          id: string;
          task_id: string;
          client_id: string;
          author_user_id: string;
          author_role: 'consultant' | 'client';
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['task_comments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['task_comments']['Insert']>;
      };

      task_approvals: {
        Row: {
          id: string;
          task_id: string;
          client_id: string;
          requested_by_user_id: string;
          responded_by_user_id: string | null;
          status: 'pending' | 'approved' | 'rejected';
          client_note: string | null;
          requested_at: string;
          responded_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['task_approvals']['Row'], 'requested_at'>;
        Update: Partial<Database['public']['Tables']['task_approvals']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'consultant' | 'client';
      package_tier: 'starter' | 'growth' | 'enterprise' | 'custom';
      service_request_status: 'pending' | 'reviewing' | 'accepted' | 'declined' | 'converted';
      approval_status: 'pending' | 'approved' | 'rejected';
    };
  };
}
