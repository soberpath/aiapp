# Supabase Setup Guide — NextLogicAI Hub

This file walks you through activating the entire cloud backend in under 15 minutes.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier is fine to start)
2. Click **New Project**
3. Name it `nextlogicai-hub`, choose a region close to you, set a strong DB password
4. Wait ~2 minutes for it to provision

---

## Step 2 — Run the schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** (green button)

This creates all tables, row-level security policies, realtime subscriptions, triggers, and seeds 4 default service packages.

---

## Step 3 — Get your API credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdefghij.supabase.co`)
   - **anon / public key** (the long `eyJ...` string)

---

## Step 4 — Add credentials to the app

Open `src/config/supabase.ts` and replace the two placeholder values:

```ts
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';   // ← paste here
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                    // ← paste here
```

---

## Step 5 — Create your consultant account

1. In Supabase dashboard, go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a strong password
4. After creating, click **SQL Editor** and run:

```sql
-- Replace the email below with yours
update profiles
set role = 'consultant'
where email = 'you@youremail.com';
```

This promotes your account to `consultant` role, giving full access to everything.

---

## Step 6 — Invite a client (when ready)

When you accept a service request and want to give a client portal access, call:

```ts
import { signUpClient } from './src/auth';

await signUpClient(
  'client@theirbusiness.com',
  'TemporaryPassword123',   // they'll reset this
  'Jane Smith',
  'CLIENT_ID_FROM_YOUR_DB', // the Client.id from your local SQLite record
);
```

Or do it directly in the Supabase dashboard under **Authentication → Users → Add user**, then run:

```sql
update profiles
set role = 'client', client_id = 'YOUR_CLIENT_ID'
where email = 'client@theirbusiness.com';
```

---

## What's ready to build next

### Customer Web Portal
Create a Next.js or React app that imports from `src/services/` and `src/auth/`:

```ts
import { signInWithEmail } from './src/auth';
import { getMessages, subscribeToMessages } from './src/services';
```

All the data layer is already written. Just build the UI.

### Public Store / Service Request Form
The `submitServiceRequest()` function in `src/services/serviceRequestService.ts`
requires **no authentication**. Point any web form at it — no backend code needed.

```ts
import { submitServiceRequest } from './src/services';

await submitServiceRequest({
  packageId: 'uuid-of-selected-package',
  packageName: 'AI Discovery Sprint',
  businessName: 'Acme Dental',
  industry: 'Healthcare',
  contactName: 'Dr. Jane Smith',
  contactEmail: 'jane@acmedental.com',
  message: "We're spending 3 hours a day on appointment scheduling...",
});
```

### Real-time Chat
Subscribe to messages in any component:

```ts
import { subscribeToMessages, sendMessage } from './src/services';

useEffect(() => {
  const unsub = subscribeToMessages(clientId, (msg) => {
    setMessages(prev => [...prev, msg]);
  });
  return unsub;
}, [clientId]);
```

### Service Packages Management
In the consultant app, list and toggle packages:

```ts
import { getAllPackages, togglePackageActive } from './src/services';
```

---

## Architecture Overview

```
nextlogicai-hub/
├── src/
│   ├── auth/
│   │   ├── authService.ts     ← sign in, sign out, role guards
│   │   └── authStore.ts       ← Zustand store for auth state
│   ├── config/
│   │   └── supabase.ts        ← Supabase client (add your keys here)
│   ├── services/
│   │   ├── packageService.ts       ← service store CRUD
│   │   ├── serviceRequestService.ts ← public inquiries + consultant inbox
│   │   ├── messagingService.ts     ← real-time chat
│   │   └── taskInteractionService.ts ← comments + approvals
│   └── types/
│       ├── index.ts           ← all app types including auth + store types
│       └── supabase.ts        ← DB type definitions
└── supabase/
    └── schema.sql             ← paste into Supabase SQL editor to go live
```
