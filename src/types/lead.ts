export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  lead_value: number;
  last_activity_at: string | null;
  is_qualified: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadSource = 'website' | 'facebook_ads' | 'google_ads' | 'referral' | 'events' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'won';

export interface LeadsResponse {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateLeadRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  lead_value: number;
  is_qualified: boolean;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  last_activity_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}