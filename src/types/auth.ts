// src/types/auth.ts
export interface AuthState {
  user: any;
  session: any;
  loading: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  company_name: string;
  avatar_url: string;
  industry: string;
  role: string;
  plan: 'free' | 'pro' | 'enterprise';
  plan_expires_at: string;
  created_at: string;
}