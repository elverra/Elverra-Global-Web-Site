import { supabase } from '@/lib/supabaseClient';
import { ContactSubmission, ContactFormData, ContactFilterOptions, ContactStats, ContactStatus } from '@/types/contact';

export const submitContactForm = async (formData: ContactFormData): Promise<{ data?: ContactSubmission; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          inquiry_type: formData.inquiryType,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { error: error instanceof Error ? error.message : 'Failed to submit form' };
  }
};

export const getContactSubmissions = async (filters: ContactFilterOptions = {}): Promise<{ data?: ContactSubmission[]; error?: string }> => {
  try {
    // Requête simplifiée sans jointure avec profiles
    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.inquiryType) {
      query = query.eq('inquiry_type', filters.inquiryType);
    }

    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assignedTo);
      }
    }

    if (filters.fromDate) {
      query = query.gte('created_at', `${filters.fromDate}T00:00:00.000Z`);
    }

    if (filters.toDate) {
      query = query.lte('created_at', `${filters.toDate}T23:59:59.999Z`);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},email.ilike.${searchTerm},subject.ilike.${searchTerm},message.ilike.${searchTerm}`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch submissions' };
  }
};

export const getContactSubmission = async (id: string): Promise<{ data?: ContactSubmission; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch submission' };
  }
};

export const updateContactStatus = async (
  id: string, 
  updates: {
    status?: ContactStatus | undefined;
    assigned_to?: string | null;
    resolved_at?: string | null;
  }
): Promise<{ data?: ContactSubmission; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating contact status:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update status' };
  }
};

export const getContactStats = async (): Promise<{ data?: ContactStats; error?: string }> => {
  try {
    // Get total count
    const { count: total } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    // Get counts by status
    const { data: statusData } = await supabase
      .from('contact_submissions')
      .select('status')
      .not('status', 'is', null);
      
    // Count statuses manually
    const statusCounts = statusData?.reduce((acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get counts by inquiry type
    const { data: typeData } = await supabase
      .from('contact_submissions')
      .select('inquiry_type')
      .not('inquiry_type', 'is', null);
      
    // Count inquiry types manually
    const typeCounts = typeData?.reduce((acc, { inquiry_type }) => {
      if (inquiry_type) {
        acc[inquiry_type] = (acc[inquiry_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Get counts by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: dateCounts } = await supabase
      .from('contact_submissions')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Process the data
    const byDate = dateCounts?.reduce((acc, { created_at }) => {
      if (!created_at) return acc;
      const date = new Date(created_at).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [] as Array<{ date: string; count: number }>) || [];

    const stats: ContactStats = {
      total: total || 0,
      new: statusCounts['new'] || 0,
      in_progress: statusCounts['in_progress'] || 0,
      resolved: statusCounts['resolved'] || 0,
      byType: {
        general: typeCounts['general'] || 0,
        membership: typeCounts['membership'] || 0,
        technical: typeCounts['technical'] || 0,
        partnership: typeCounts['partnership'] || 0,
        complaint: typeCounts['complaint'] || 0,
        other: typeCounts['other'] || 0
      },
      byDate
    };

    return { data: stats };
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch stats' };
  }
};
