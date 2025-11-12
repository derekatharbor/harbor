export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      dashboards: {
        Row: {
          id: string
          org_id: string
          brand_name: string
          domain: string
          plan: 'solo' | 'agency' | 'enterprise'
          public_profile: boolean
          last_fresh_scan_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          brand_name: string
          domain: string
          plan: 'solo' | 'agency' | 'enterprise'
          public_profile?: boolean
          last_fresh_scan_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          brand_name?: string
          domain?: string
          plan?: 'solo' | 'agency' | 'enterprise'
          public_profile?: boolean
          last_fresh_scan_at?: string | null
          created_at?: string
        }
      }
      plan_limits: {
        Row: {
          plan: string
          dashboards_limit: number | null
          fresh_scans_week: number | null
          fresh_scans_month: number | null
          verify_scans_week: number | null
          gen_actions_per_day: number | null
          has_optimize_tab: boolean
          has_whitelabel: boolean
        }
        Insert: {
          plan: string
          dashboards_limit?: number | null
          fresh_scans_week?: number | null
          fresh_scans_month?: number | null
          verify_scans_week?: number | null
          gen_actions_per_day?: number | null
          has_optimize_tab?: boolean
          has_whitelabel?: boolean
        }
        Update: {
          plan?: string
          dashboards_limit?: number | null
          fresh_scans_week?: number | null
          fresh_scans_month?: number | null
          verify_scans_week?: number | null
          gen_actions_per_day?: number | null
          has_optimize_tab?: boolean
          has_whitelabel?: boolean
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          org_id: string | null
          dashboard_id: string | null
          role: 'owner' | 'editor' | 'viewer'
        }
        Insert: {
          id?: string
          user_id: string
          org_id?: string | null
          dashboard_id?: string | null
          role: 'owner' | 'editor' | 'viewer'
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string | null
          dashboard_id?: string | null
          role?: 'owner' | 'editor' | 'viewer'
        }
      }
      scans: {
        Row: {
          id: string
          dashboard_id: string
          type: 'fresh' | 'verification'
          status: 'queued' | 'running' | 'partial' | 'failed' | 'done'
          started_at: string | null
          finished_at: string | null
          cost_tokens: number
          cost_usd: number
        }
        Insert: {
          id?: string
          dashboard_id: string
          type: 'fresh' | 'verification'
          status?: 'queued' | 'running' | 'partial' | 'failed' | 'done'
          started_at?: string | null
          finished_at?: string | null
          cost_tokens?: number
          cost_usd?: number
        }
        Update: {
          id?: string
          dashboard_id?: string
          type?: 'fresh' | 'verification'
          status?: 'queued' | 'running' | 'partial' | 'failed' | 'done'
          started_at?: string | null
          finished_at?: string | null
          cost_tokens?: number
          cost_usd?: number
        }
      }
      scan_jobs: {
        Row: {
          id: string
          scan_id: string
          module: 'shopping' | 'brand' | 'conversations' | 'website'
          status: string
          error: string | null
          token_used: number
          started_at: string | null
          finished_at: string | null
        }
        Insert: {
          id?: string
          scan_id: string
          module: 'shopping' | 'brand' | 'conversations' | 'website'
          status?: string
          error?: string | null
          token_used?: number
          started_at?: string | null
          finished_at?: string | null
        }
        Update: {
          id?: string
          scan_id?: string
          module?: 'shopping' | 'brand' | 'conversations' | 'website'
          status?: string
          error?: string | null
          token_used?: number
          started_at?: string | null
          finished_at?: string | null
        }
      }
      results_shopping: {
        Row: {
          scan_id: string
          model: string
          category: string
          product: string
          brand: string
          rank: number
          confidence: number
        }
        Insert: {
          scan_id: string
          model: string
          category: string
          product: string
          brand: string
          rank: number
          confidence: number
        }
        Update: {
          scan_id?: string
          model?: string
          category?: string
          product?: string
          brand?: string
          rank?: number
          confidence?: number
        }
      }
      results_brand: {
        Row: {
          id: string
          scan_id: string
          descriptor: string
          sentiment: 'pos' | 'neu' | 'neg'
          weight: number
          source_model: string
        }
        Insert: {
          id?: string
          scan_id: string
          descriptor: string
          sentiment: 'pos' | 'neu' | 'neg'
          weight: number
          source_model: string
        }
        Update: {
          id?: string
          scan_id?: string
          descriptor?: string
          sentiment?: 'pos' | 'neu' | 'neg'
          weight?: number
          source_model?: string
        }
      }
      results_conversations: {
        Row: {
          id: string
          scan_id: string
          question: string
          intent: string
          score: number
          emerging: boolean
        }
        Insert: {
          id?: string
          scan_id: string
          question: string
          intent: string
          score: number
          emerging?: boolean
        }
        Update: {
          id?: string
          scan_id?: string
          question?: string
          intent?: string
          score?: number
          emerging?: boolean
        }
      }
      results_site: {
        Row: {
          id: string
          scan_id: string
          url: string
          issue_code: string
          severity: 'low' | 'med' | 'high'
          schema_found: boolean
          details: Json
        }
        Insert: {
          id?: string
          scan_id: string
          url: string
          issue_code: string
          severity: 'low' | 'med' | 'high'
          schema_found: boolean
          details: Json
        }
        Update: {
          id?: string
          scan_id?: string
          url?: string
          issue_code?: string
          severity?: 'low' | 'med' | 'high'
          schema_found?: boolean
          details?: Json
        }
      }
      optimization_tasks: {
        Row: {
          id: string
          dashboard_id: string
          module: 'shopping' | 'brand' | 'conversations' | 'website'
          title: string
          description: string
          status: 'pending' | 'in_progress' | 'done'
          impact_estimate: number
          linked_urls: string[]
          created_by_scan_id: string | null
          closed_by_scan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dashboard_id: string
          module: 'shopping' | 'brand' | 'conversations' | 'website'
          title: string
          description: string
          status?: 'pending' | 'in_progress' | 'done'
          impact_estimate: number
          linked_urls: string[]
          created_by_scan_id?: string | null
          closed_by_scan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dashboard_id?: string
          module?: 'shopping' | 'brand' | 'conversations' | 'website'
          title?: string
          description?: string
          status?: 'pending' | 'in_progress' | 'done'
          impact_estimate?: number
          linked_urls?: string[]
          created_by_scan_id?: string | null
          closed_by_scan_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      llm_cache: {
        Row: {
          key: string
          brand_id: string | null
          module: string | null
          model_version: string | null
          prompt_version: string | null
          created_at: string
          expires_at: string | null
          raw: Json
          normalized: Json
        }
        Insert: {
          key: string
          brand_id?: string | null
          module?: string | null
          model_version?: string | null
          prompt_version?: string | null
          created_at?: string
          expires_at?: string | null
          raw: Json
          normalized: Json
        }
        Update: {
          key?: string
          brand_id?: string | null
          module?: string | null
          model_version?: string | null
          prompt_version?: string | null
          created_at?: string
          expires_at?: string | null
          raw?: Json
          normalized?: Json
        }
      }
      global_cache: {
        Row: {
          key: string
          raw: Json
          normalized: Json
          expires_at: string | null
        }
        Insert: {
          key: string
          raw: Json
          normalized: Json
          expires_at?: string | null
        }
        Update: {
          key?: string
          raw?: Json
          normalized?: Json
          expires_at?: string | null
        }
      }
      generated_snippets: {
        Row: {
          id: string
          dashboard_id: string
          action: string
          inputs: Json
          output: string
          created_at: string
        }
        Insert: {
          id?: string
          dashboard_id: string
          action: string
          inputs: Json
          output: string
          created_at?: string
        }
        Update: {
          id?: string
          dashboard_id?: string
          action?: string
          inputs?: Json
          output?: string
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          org_id: string | null
          dashboard_id: string | null
          event: string
          meta: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          org_id?: string | null
          dashboard_id?: string | null
          event: string
          meta: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          org_id?: string | null
          dashboard_id?: string | null
          event?: string
          meta?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
