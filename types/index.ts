export type OpportunityCategory = 'scholarship' | 'fellowship' | 'accelerator' | 'grant' | 'competition' | 'conference' | 'exchange_program' | 'government_scheme' | 'giveaway' | 'other';
export type RemoteType = 'remote' | 'in-person' | 'hybrid' | null;
export type OpportunityStatus = 'active' | 'expired' | 'raw';
export type SavedApplicationStatus = 'Saved' | 'Planning to Apply' | 'Applied' | 'Interview' | 'Accepted' | 'Rejected' | 'Waitlisted';
export type SavedPriority = 'Low' | 'Medium' | 'High';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  country: string | null;
  region: string | null;
  category: OpportunityCategory;
  description: string;
  eligibility: string | null;
  funding_amount: string | null;
  deadline: string | null;
  application_link: string;
  source_url: string;
  tags: string[];
  remote_type: RemoteType;
  women_founder_friendly: boolean;
  indian_applicant_eligible: boolean;
  student_eligible: boolean;
  age_limit: string | null;
  application_fee: string | null;
  status: OpportunityStatus;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string | null;
  opportunity_id: string;
  application_status: SavedApplicationStatus;
  priority: SavedPriority;
  notes: string | null;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
}

export interface ApplicationTimeline {
  id: string;
  saved_opportunity_id: string;
  status: SavedApplicationStatus;
  note: string | null;
  created_at: string;
}

export interface OpportunityFilters {
  search?: string;
  category?: OpportunityCategory;
  country?: string;
  remote_type?: RemoteType;
  women_founder_friendly?: boolean;
  indian_applicant_eligible?: boolean;
  student_eligible?: boolean;
  ai_mode?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
