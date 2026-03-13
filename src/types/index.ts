export type ClientStatus = 'active' | 'onboarding' | 'paused' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type Phase = 'discovery' | 'strategy' | 'implementation' | 'review' | 'optimization' | 'maintenance';

export interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  currentPhase: Phase;
  progress: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  phase: Phase;
  status: TaskStatus;
  order?: number;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  aiContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  notes?: string;
  aiScore?: number;
  aiSummary?: string;
  createdAt: string;
}

// ─── Auth & Roles ─────────────────────────────────────────────────────────────

/** consultant = you (the NextLogicAI operator), client = your paying customer */
export type UserRole = 'consultant' | 'client';

export interface AuthUser {
  id: string;           // Supabase auth.users UUID
  email: string;
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
  clientId?: string;    // set when role === 'client', links to the Client record
  createdAt: string;
}

// ─── Service Store (online ordering) ─────────────────────────────────────────

export type PackageTier = 'starter' | 'growth' | 'enterprise' | 'custom';

export interface ServicePackage {
  id: string;
  name: string;                  // e.g. "AI Discovery Sprint"
  tier: PackageTier;
  description: string;
  features: string[];            // bullet-point list shown on the store
  priceUsd: number | null;       // null = "contact for pricing"
  pricingLabel?: string;         // override display e.g. "Starting at $500/mo"
  phases: Phase[];               // which consulting phases are included
  isActive: boolean;             // consultant can toggle visibility
  sortOrder: number;
  createdAt: string;
}

export type ServiceRequestStatus =
  | 'pending'      // just submitted, awaiting consultant review
  | 'reviewing'    // consultant has seen it
  | 'accepted'     // consultant accepted, client becomes a real Client record
  | 'declined'     // not a fit right now
  | 'converted';   // Client record created, engagement started

export interface ServiceRequest {
  id: string;
  packageId: string | null;       // null = fully custom inquiry
  packageName?: string;           // snapshot at time of request
  status: ServiceRequestStatus;
  businessName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  message?: string;
  clientId?: string;
  consultantNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export type MessageSenderRole = 'consultant' | 'client';

export interface Message {
  id: string;
  clientId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
  readByConsultant: boolean;
  readByClient: boolean;
  createdAt: string;
}

// ─── Task Interactions (client-facing) ────────────────────────────────────────

export interface TaskComment {
  id: string;
  taskId: string;
  clientId: string;
  authorUserId: string;
  authorRole: UserRole;
  authorName: string;
  body: string;
  createdAt: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TaskApproval {
  id: string;
  taskId: string;
  clientId: string;
  requestedByUserId: string;
  respondedByUserId?: string;
  status: ApprovalStatus;
  clientNote?: string;
  requestedAt: string;
  respondedAt?: string;
}
