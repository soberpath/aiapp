import { create } from 'zustand';
import { Client, Task, Prospect } from '../types';
import { getDatabase, generateId } from '../db/database';
import { DEFAULT_TASKS } from '../data/defaultTasks';

interface AppState {
  clients: Client[];
  tasks: Task[];
  prospects: Prospect[];
  cloudflareUrl: string;
  claudeApiKey: string;
  loading: boolean;

  loadAll: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveCloudflareUrl: (url: string) => Promise<void>;
  saveClaudeApiKey: (key: string) => Promise<void>;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addProspect: (prospect: Omit<Prospect, 'id' | 'createdAt'>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;

  generateAiContent: (taskId: string) => Promise<string>;
  generateAiForm: (taskId: string) => Promise<string>;
  searchProspects: (query: string, location: string) => Promise<any[]>;

  syncWithCloud: () => Promise<{ success: boolean; message: string }>;
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  tasks: [],
  prospects: [],
  cloudflareUrl: '',
  claudeApiKey: '',
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const db = await getDatabase();
    const clients = await db.getAllAsync<Client>('SELECT * FROM clients ORDER BY updatedAt DESC');
    const tasks = await db.getAllAsync<Task>('SELECT * FROM tasks ORDER BY taskOrder ASC, createdAt ASC');
    const prospects = await db.getAllAsync<Prospect>('SELECT * FROM prospects ORDER BY createdAt DESC');
    set({ clients, tasks, prospects, loading: false });
  },

  loadSettings: async () => {
    const db = await getDatabase();
    const urlRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['cloudflareUrl']);
    const keyRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['claudeApiKey']);
    if (urlRow) set({ cloudflareUrl: urlRow.value });
    if (keyRow) set({ claudeApiKey: keyRow.value });
  },

  saveCloudflareUrl: async (url: string) => {
    const db = await getDatabase();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['cloudflareUrl', url]);
    set({ cloudflareUrl: url });
  },

  saveClaudeApiKey: async (key: string) => {
    const db = await getDatabase();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['claudeApiKey', key]);
    set({ claudeApiKey: key });
  },

  addClient: async (clientData) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const client: Client = { ...clientData, id: generateId(), createdAt: now, updatedAt: now };
    await db.runAsync(
      'INSERT INTO clients (id,name,company,industry,email,phone,status,currentPhase,progress,notes,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [client.id, client.name, client.company, client.industry || '', client.email, client.phone || null, client.status, client.currentPhase, client.progress, client.notes || null, client.createdAt, client.updatedAt]
    );

    // Seed all default tasks for this client
    const taskInserts: Task[] = DEFAULT_TASKS.map(dt => ({
      id: generateId(),
      clientId: client.id,
      title: dt.title,
      description: dt.description,
      phase: dt.phase,
      status: 'pending' as const,
      order: dt.order,
      createdAt: now,
      updatedAt: now,
    }));

    for (const task of taskInserts) {
      await db.runAsync(
        'INSERT INTO tasks (id,clientId,title,description,phase,status,taskOrder,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)',
        [task.id, task.clientId, task.title, task.description || null, task.phase, task.status, task.order || 0, task.createdAt, task.updatedAt]
      );
    }

    set(state => ({
      clients: [client, ...state.clients],
      tasks: [...state.tasks, ...taskInserts],
    }));

    return client;
  },

  updateClient: async (id, updates) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const current = get().clients.find(c => c.id === id);
    if (!current) return;
    const updated = { ...current, ...updates, updatedAt: now };
    await db.runAsync(
      'UPDATE clients SET name=?,company=?,industry=?,email=?,phone=?,status=?,currentPhase=?,progress=?,notes=?,updatedAt=? WHERE id=?',
      [updated.name, updated.company, updated.industry || '', updated.email, updated.phone || null, updated.status, updated.currentPhase, updated.progress, updated.notes || null, now, id]
    );
    set(state => ({ clients: state.clients.map(c => c.id === id ? updated : c) }));
  },

  deleteClient: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE clientId = ?', [id]);
    await db.runAsync('DELETE FROM clients WHERE id = ?', [id]);
    set(state => ({
      clients: state.clients.filter(c => c.id !== id),
      tasks: state.tasks.filter(t => t.clientId !== id),
    }));
  },

  addTask: async (taskData) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const task: Task = { ...taskData, id: generateId(), createdAt: now, updatedAt: now };
    await db.runAsync(
      'INSERT INTO tasks (id,clientId,title,description,phase,status,taskOrder,dueDate,assignedTo,notes,aiContent,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [task.id, task.clientId, task.title, task.description || null, task.phase, task.status, task.order || 0, task.dueDate || null, task.assignedTo || null, task.notes || null, task.aiContent || null, task.createdAt, task.updatedAt]
    );
    set(state => ({ tasks: [...state.tasks, task] }));
  },

  updateTask: async (id, updates) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const current = get().tasks.find(t => t.id === id);
    if (!current) return;
    const updated = { ...current, ...updates, updatedAt: now };
    await db.runAsync(
      'UPDATE tasks SET title=?,description=?,phase=?,status=?,taskOrder=?,dueDate=?,assignedTo=?,notes=?,aiContent=?,updatedAt=? WHERE id=?',
      [updated.title, updated.description || null, updated.phase, updated.status, updated.order || 0, updated.dueDate || null, updated.assignedTo || null, updated.notes || null, updated.aiContent || null, now, id]
    );

    const newTasks = get().tasks.map(t => t.id === id ? updated : t);
    set({ tasks: newTasks });

    // Recalculate and persist client progress
    if (updates.status !== undefined) {
      const clientId = updated.clientId;
      const clientTasks = newTasks.filter(t => t.clientId === clientId);
      const done = clientTasks.filter(t => t.status === 'completed').length;
      const progress = clientTasks.length > 0 ? Math.round(done / clientTasks.length * 100) : 0;
      await db.runAsync('UPDATE clients SET progress=?,updatedAt=? WHERE id=?', [progress, now, clientId]);
      set(state => ({
        clients: state.clients.map(c => c.id === clientId ? { ...c, progress, updatedAt: now } : c),
      }));
    }
  },

  deleteTask: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  addProspect: async (prospectData) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const prospect: Prospect = { ...prospectData, id: generateId(), createdAt: now };
    await db.runAsync(
      'INSERT INTO prospects (id,businessName,industry,location,website,contactName,contactEmail,phone,notes,aiScore,aiSummary,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [prospect.id, prospect.businessName, prospect.industry || null, prospect.location || null, prospect.website || null, prospect.contactName || null, prospect.contactEmail || null, prospect.phone || null, prospect.notes || null, prospect.aiScore || null, prospect.aiSummary || null, prospect.createdAt]
    );
    set(state => ({ prospects: [prospect, ...state.prospects] }));
  },

  deleteProspect: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM prospects WHERE id = ?', [id]);
    set(state => ({ prospects: state.prospects.filter(p => p.id !== id) }));
  },

  generateAiContent: async (taskId: string) => {
    const { tasks, clients, claudeApiKey } = get();
    const task = tasks.find(t => t.id === taskId);
    const client = clients.find(c => c.id === task?.clientId);
    if (!task || !client) return 'Task or client not found';
    if (!claudeApiKey) return 'No Claude API key set. Add it in Settings.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an AI business consultant assistant helping with a consulting engagement.

Client: ${client.name}
Company: ${client.company}
Industry: ${client.industry || 'Not specified'}
Phase: ${task.phase}
Task: ${task.title}
Task Description: ${task.description || ''}

Generate helpful, actionable content for this specific consulting task. Include:
- A brief approach (2-3 sentences)
- 3-5 specific action items tailored to this client's industry
- Key questions to ask or things to watch out for
- Expected outcome

Make it specific to the ${client.industry || 'business'} industry. Keep it practical and concise.`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return (err as any)?.error?.message || `API error ${response.status}`;
    }
    const data = await response.json();
    const content = data?.content?.[0]?.text || 'Failed to generate content.';
    await get().updateTask(taskId, { aiContent: content });
    return content;
  },

  generateAiForm: async (taskId: string) => {
    const { tasks, clients, claudeApiKey } = get();
    const task = tasks.find(t => t.id === taskId);
    const client = clients.find(c => c.id === task?.clientId);
    if (!task || !client) return 'Task or client not found';
    if (!claudeApiKey) return 'No Claude API key set. Add it in Settings.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are an AI business consultant. Generate a structured intake form or checklist for this consulting task.

Client: ${client.name}
Company: ${client.company}  
Industry: ${client.industry || 'Not specified'}
Task: ${task.title}
Description: ${task.description || ''}

Create a detailed form/checklist that the consultant should fill out during or after this task. Include:
- Section headers
- Specific questions or fields to fill in
- Checkboxes for key items to verify
- Space for observations/findings

Format it as a clean, ready-to-use document. Make fields specific to the ${client.industry || 'business'} industry.`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return (err as any)?.error?.message || `API error ${response.status}`;
    }
    const data = await response.json();
    const content = data?.content?.[0]?.text || 'Failed to generate form.';
    await get().updateTask(taskId, { aiContent: content });
    return content;
  },

  searchProspects: async (query: string, location: string) => {
    const { claudeApiKey } = get();
    if (!claudeApiKey) throw new Error('No Claude API key set. Add it in Settings.');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are a business development AI for an AI consulting firm. Generate 6 realistic potential business prospects.

Search: "${query}" businesses in "${location || 'any location'}"

Return ONLY a valid JSON array, no other text, no markdown:
[
  {
    "name": "Business Name",
    "industry": "Specific Industry",
    "location": "City, State",
    "phone": "555-0100",
    "website": "www.example.com",
    "contactName": "Owner/Manager Name",
    "score": 85,
    "summary": "Why this business would benefit from AI consulting in one sentence."
  }
]

Make names and details realistic and varied. Score 60-95 based on AI adoption potential.`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message || `API error ${response.status}`);
    }
    const data = await response.json();
    const text = data?.content?.[0]?.text || '[]';
    try {
      const match = text.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    } catch {
      return [];
    }
  },

  syncWithCloud: async () => {
    const { cloudflareUrl, clients, tasks, prospects } = get();
    if (!cloudflareUrl) return { success: false, message: 'No Cloudflare URL set' };
    try {
      const response = await fetch(`${cloudflareUrl}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, tasks, prospects }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json().catch(() => null);
      if (data?.clients && data?.tasks && data?.prospects) {
        set({ clients: data.clients, tasks: data.tasks, prospects: data.prospects });
      }
      return { success: true, message: 'Sync successful!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Sync failed' };
    }
  },
}));
