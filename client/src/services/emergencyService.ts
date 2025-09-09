const API_BASE_URL = '/api/secours';
import { ServiceRequest } from '@/components/dashboard/sections/OSecoursSection';

/**
 * Fetch service requests for the current user
 */
export const fetchServiceRequests = async (): Promise<ServiceRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch service requests');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching service requests:', error);
    throw error;
  }
};

/**
 * Create a new service request
 */
export const createServiceRequest = async (
  serviceRequest: Omit<ServiceRequest, 'id' | 'status' | 'requestDate'>
): Promise<ServiceRequest> => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(serviceRequest),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create service request');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating service request:', error);
    throw error;
  }
};

/**
 * Update a service request status
 */
export const updateServiceRequestStatus = async (
  requestId: string, 
  status: 'in-progress' | 'completed' | 'cancelled'
): Promise<ServiceRequest> => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update service request status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating service request status:', error);
    throw error;
  }
};
