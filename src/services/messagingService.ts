import { supabase } from '../config/supabase';
import type { Message, MessageSenderRole } from '../types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Get all messages for a client engagement, oldest first (chat order).
 */
export async function getMessages(clientId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToMessage);
}

// ─── Send ─────────────────────────────────────────────────────────────────────

export interface SendMessageInput {
  clientId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
}

export async function sendMessage(input: SendMessageInput): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: crypto.randomUUID(),
      client_id: input.clientId,
      sender_user_id: input.senderUserId,
      sender_role: input.senderRole,
      sender_name: input.senderName,
      body: input.body,
      read_by_consultant: input.senderRole === 'consultant', // sender auto-reads
      read_by_client: input.senderRole === 'client',
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to send message');
  return rowToMessage(data);
}

// ─── Read Receipts ────────────────────────────────────────────────────────────

/**
 * Mark all messages in a thread as read by the consultant.
 */
export async function markReadByConsultant(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_by_consultant: true })
    .eq('client_id', clientId)
    .eq('read_by_consultant', false);

  if (error) throw new Error(error.message);
}

/**
 * Mark all messages in a thread as read by the client.
 */
export async function markReadByClient(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_by_client: true })
    .eq('client_id', clientId)
    .eq('read_by_client', false);

  if (error) throw new Error(error.message);
}

/**
 * Count unread messages for the consultant across all clients.
 * Use this for the badge on the consultant dashboard.
 */
export async function getUnreadCountForConsultant(): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('read_by_consultant', false)
    .eq('sender_role', 'client'); // only count messages FROM clients

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ─── Real-time Subscription ───────────────────────────────────────────────────

/**
 * Subscribe to new messages in a client thread.
 * Powered by Supabase Realtime — no polling needed.
 * Returns an unsubscribe function.
 *
 * Usage:
 *   const unsub = subscribeToMessages(clientId, (msg) => setMessages(prev => [...prev, msg]));
 *   return () => unsub();
 */
export function subscribeToMessages(
  clientId: string,
  onMessage: (message: Message) => void,
): () => void {
  const channel = supabase
    .channel(`messages:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `client_id=eq.${clientId}`,
      },
      payload => {
        onMessage(rowToMessage(payload.new as Record<string, unknown>));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    senderUserId: row.sender_user_id as string,
    senderRole: row.sender_role as MessageSenderRole,
    senderName: row.sender_name as string,
    body: row.body as string,
    readByConsultant: row.read_by_consultant as boolean,
    readByClient: row.read_by_client as boolean,
    createdAt: row.created_at as string,
  };
}
