import { supabase } from '../config/supabase';
import type { TaskComment, TaskApproval, ApprovalStatus, UserRole } from '../types';

// ─── Task Comments ────────────────────────────────────────────────────────────

/**
 * Get all comments on a task, oldest first.
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToComment);
}

/**
 * Get all comments for a client across all their tasks.
 * Useful for a "recent activity" feed in the client portal.
 */
export async function getClientComments(clientId: string): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToComment);
}

export interface AddCommentInput {
  taskId: string;
  clientId: string;
  authorUserId: string;
  authorRole: UserRole;
  authorName: string;
  body: string;
}

export async function addTaskComment(input: AddCommentInput): Promise<TaskComment> {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      id: crypto.randomUUID(),
      task_id: input.taskId,
      client_id: input.clientId,
      author_user_id: input.authorUserId,
      author_role: input.authorRole,
      author_name: input.authorName,
      body: input.body,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to add comment');
  return rowToComment(data);
}

export async function deleteTaskComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId);
  if (error) throw new Error(error.message);
}

// ─── Task Approvals ───────────────────────────────────────────────────────────

/**
 * Get all approval requests for a task.
 */
export async function getTaskApprovals(taskId: string): Promise<TaskApproval[]> {
  const { data, error } = await supabase
    .from('task_approvals')
    .select('*')
    .eq('task_id', taskId)
    .order('requested_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToApproval);
}

/**
 * Get all pending approvals for a client — the "action required" list.
 */
export async function getPendingApprovalsForClient(clientId: string): Promise<TaskApproval[]> {
  const { data, error } = await supabase
    .from('task_approvals')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToApproval);
}

/**
 * Consultant requests client sign-off on a task.
 */
export async function requestApproval(
  taskId: string,
  clientId: string,
  requestedByUserId: string,
): Promise<TaskApproval> {
  const { data, error } = await supabase
    .from('task_approvals')
    .insert({
      id: crypto.randomUUID(),
      task_id: taskId,
      client_id: clientId,
      requested_by_user_id: requestedByUserId,
      responded_by_user_id: null,
      status: 'pending',
      client_note: null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to request approval');
  return rowToApproval(data);
}

/**
 * Client approves or rejects a task.
 */
export async function respondToApproval(
  approvalId: string,
  respondedByUserId: string,
  status: Exclude<ApprovalStatus, 'pending'>,
  clientNote?: string,
): Promise<void> {
  const { error } = await supabase
    .from('task_approvals')
    .update({
      status,
      responded_by_user_id: respondedByUserId,
      client_note: clientNote ?? null,
      responded_at: new Date().toISOString(),
    })
    .eq('id', approvalId);

  if (error) throw new Error(error.message);
}

// ─── Real-time: comments ──────────────────────────────────────────────────────

/**
 * Subscribe to new comments on a specific task.
 * Returns unsubscribe function.
 */
export function subscribeToTaskComments(
  taskId: string,
  onComment: (comment: TaskComment) => void,
): () => void {
  const channel = supabase
    .channel(`task_comments:${taskId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${taskId}`,
      },
      payload => {
        onComment(rowToComment(payload.new as Record<string, unknown>));
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToComment(row: Record<string, unknown>): TaskComment {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    clientId: row.client_id as string,
    authorUserId: row.author_user_id as string,
    authorRole: row.author_role as UserRole,
    authorName: row.author_name as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

function rowToApproval(row: Record<string, unknown>): TaskApproval {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    clientId: row.client_id as string,
    requestedByUserId: row.requested_by_user_id as string,
    respondedByUserId: (row.responded_by_user_id as string) ?? undefined,
    status: row.status as ApprovalStatus,
    clientNote: (row.client_note as string) ?? undefined,
    requestedAt: row.requested_at as string,
    respondedAt: (row.responded_at as string) ?? undefined,
  };
}
