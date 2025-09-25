export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed' | 'spam';
export type InquiryType = 'general' | 'membership' | 'technical' | 'partnership' | 'complaint' | 'other';

export interface ContactFilterOptions {
  search?: string;
  status?: ContactStatus;
  inquiryType?: InquiryType | '';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}

// Alias for backward compatibility
export type ContactFilters = ContactFilterOptions;

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiry_type: InquiryType;
  status: ContactStatus;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  assigned_user?: {
    id: string;
    email: string;
    full_name?: string;
  } | null;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: InquiryType;
}

export interface ContactFilterOptions {
  status?: ContactStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  assignedTo?: string;
  inquiryType?: InquiryType | '';
}

export interface ContactStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  byType: Record<InquiryType, number>;
  byDate: Array<{ date: string; count: number }>;
}
