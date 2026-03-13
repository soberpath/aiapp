import { supabase } from '../config/supabase';
import type { ServiceRequest, ServiceRequestStatus } from '../types';

// ─── Public (no auth required) ───────────────────────────────────────────────

/**
 * Submit a new service request from the public store.
 * No authentication required — this is the "contact / buy" form.
 */
export interface SubmitRequestInput {
  packageId?: string;
  packageName?: string;
  businessName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  message?: string;
}

export async function submitServiceRequest(input: SubmitRequestInput): Promise<ServiceRequest> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      id: crypto.randomUUID(),
      package_id: input.packageId ?? null,
      package_name: input.packageName ?? null,
      status: 'pending',
      business_name: input.businessName,
      industry: input.industry,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      phone: input.phone ?? null,
      website: input.website ?? null,
      message: input.message ?? null,
      client_id: null,
      consultant_notes: null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to submit request');
  return rowToRequest(data);
}

// ─── Consultant-only ──────────────────────────────────────────────────────────

/**
 * Fetch all service requests, newest first.
 */
export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToRequest);
}

/**
 * Fetch only pending + reviewing requests — the consultant inbox.
 */
export async function getPendingRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .in('status', ['pending', 'reviewing'])
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToRequest);
}

/**
 * Update the status of a service request.
 * e.g. move from 'pending' → 'reviewing' → 'accepted' → 'converted'
 */
export async function updateRequestStatus(
  id: string,
  status: ServiceRequestStatus,
  consultantNotes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('service_requests')
    .update({
      status,
      ...(consultantNotes !== undefined && { consultant_notes: consultantNotes }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/**
 * Accept a request and link it to an existing Client record.
 * Call this after you've created the Client in your local DB/Supabase.
 */
export async function acceptAndConvert(
  requestId: string,
  clientId: string,
  consultantNotes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('service_requests')
    .update({
      status: 'converted',
      client_id: clientId,
      consultant_notes: consultantNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw new Error(error.message);
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToRequest(row: Record<string, unknown>): ServiceRequest {
  return {
    id: row.id as string,
    packageId: (row.package_id as string) ?? null,
    packageName: (row.package_name as string) ?? undefined,
    status: row.status as ServiceRequestStatus,
    businessName: row.business_name as string,
    industry: row.industry as string,
    contactName: row.contact_name as string,
    contactEmail: row.contact_email as string,
    phone: (row.phone as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    message: (row.message as string) ?? undefined,
    clientId: (row.client_id as string) ?? undefined,
    consultantNotes: (row.consultant_notes as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
