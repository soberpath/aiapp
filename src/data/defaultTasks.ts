import { Phase } from '../types';

export interface DefaultTask {
  title: string;
  description: string;
  phase: Phase;
  order: number;
}

export const DEFAULT_TASKS: DefaultTask[] = [
  // Phase 1: First Contact & Business Discovery
  { phase: 'discovery', order: 1, title: 'Initial Outreach / Intro Call', description: 'Introduce yourself and your services; briefly explain how AI can benefit small businesses without overwhelming the owner' },
  { phase: 'discovery', order: 2, title: 'Understand the Business', description: 'Ask foundational questions: What do you sell? Who are your customers? How many employees? What does a typical day look like?' },
  { phase: 'discovery', order: 3, title: 'Identify Pain Points', description: 'Dig into where time is wasted, where mistakes happen, what tasks are repetitive, and what keeps the owner up at night' },
  { phase: 'discovery', order: 4, title: 'Assess Tech Comfort Level', description: "Gauge the owner's and team's familiarity with technology; identify any resistance or fear around AI adoption" },
  { phase: 'discovery', order: 5, title: 'Review Current Tools & Software', description: 'Inventory all existing software, apps, and platforms the business uses (POS, CRM, email, scheduling, accounting, etc.)' },
  { phase: 'discovery', order: 6, title: 'Define Goals & Success Metrics', description: 'Establish what success looks like: time saved, revenue increased, errors reduced, customer satisfaction improved' },
  { phase: 'discovery', order: 7, title: 'Sign Consulting Agreement / NDA', description: 'Execute a consulting services agreement and NDA to protect both parties before sharing sensitive business information' },

  // Phase 2: Business Audit & AI Opportunity Assessment
  { phase: 'strategy', order: 1, title: 'Map All Business Processes', description: 'Create a visual map of every core workflow: sales, operations, customer service, marketing, admin, and fulfillment' },
  { phase: 'strategy', order: 2, title: 'Identify Automation Opportunities', description: 'Flag repetitive, rule-based tasks that can be automated with AI or software (data entry, scheduling, follow-ups, invoicing)' },
  { phase: 'strategy', order: 3, title: 'Analyze Data & Reporting Gaps', description: 'Determine what data the business collects vs. what it should track; identify gaps in reporting and decision-making' },
  { phase: 'strategy', order: 4, title: 'Evaluate Customer Journey', description: 'Review how customers find, buy from, and interact with the business; identify friction points and drop-offs' },
  { phase: 'strategy', order: 5, title: 'Research AI Tool Options', description: 'Identify 2-3 AI tools per opportunity area that match the business size, budget, and technical capability' },
  { phase: 'strategy', order: 6, title: 'Conduct ROI Analysis', description: 'Estimate time saved, cost reduced, or revenue gained for each AI opportunity to prioritize implementation order' },
  { phase: 'strategy', order: 7, title: 'Present Audit Findings', description: 'Deliver a clear, visual audit report showing current state, opportunities, and recommended priorities' },
  { phase: 'strategy', order: 8, title: 'Get Client Sign-off on Priorities', description: 'Review findings together, answer questions, and agree on which 2-3 AI initiatives to tackle first' },

  // Phase 3: Strategy & AI Roadmap Development
  { phase: 'implementation', order: 1, title: 'Build the AI Implementation Roadmap', description: 'Create a phased 90-day plan showing what gets implemented when, by whom, and at what cost' },
  { phase: 'implementation', order: 2, title: 'Define Roles & Responsibilities', description: "Clarify who on the client's team owns each AI tool, who handles training, and who is the point of escalation" },
  { phase: 'implementation', order: 3, title: 'Set Budget & Tool Subscriptions', description: 'Finalize monthly software costs, one-time setup fees, and your consulting fee structure for implementation phase' },
  { phase: 'implementation', order: 4, title: 'Create KPIs & Tracking Dashboard', description: 'Build a simple dashboard (Google Sheets or Notion) to track the agreed success metrics week over week' },
  { phase: 'implementation', order: 5, title: 'Present Strategy & Get Approval', description: 'Walk the client through the full roadmap, explain the reasoning, handle objections, and get written approval to proceed' },
  { phase: 'implementation', order: 6, title: 'Schedule Implementation Kickoff', description: 'Book all implementation sessions, training dates, and check-in calls for the next 60 days' },

  // Phase 4: Tool Setup & AI Integration
  { phase: 'review', order: 1, title: 'Set Up AI Accounts & Subscriptions', description: 'Create and configure accounts for approved AI tools; ensure billing, access, and security are properly configured' },
  { phase: 'review', order: 2, title: 'Connect AI Tools to Existing Systems', description: 'Integrate AI tools with current software via APIs, Zapier, Make, or native integrations (e.g., AI chatbot to website, AI to CRM)' },
  { phase: 'review', order: 3, title: 'Build Automation Workflows', description: 'Design and activate automated workflows: lead follow-up sequences, appointment reminders, invoice generation, data entry, etc.' },
  { phase: 'review', order: 4, title: 'Configure AI Communication Tools', description: "Set up AI chatbots, email responders, or voice assistants trained on the business's tone, FAQs, and product info" },
  { phase: 'review', order: 5, title: 'Implement AI Content Generation', description: 'Set up AI writing workflows for social media, email newsletters, product descriptions, and ad copy creation' },

  // Phase 5: Team Training & Change Management
  { phase: 'optimization', order: 1, title: 'Assess Team Roles & AI Impact', description: 'Identify which employees will use AI tools directly and how their daily responsibilities will shift' },
  { phase: 'optimization', order: 2, title: 'Develop Training Materials', description: 'Create simple, role-specific guides, cheat sheets, and video walkthroughs tailored to each AI tool being introduced' },
  { phase: 'optimization', order: 3, title: 'Conduct Live Training Sessions', description: 'Lead hands-on training with staff; demonstrate tools in real scenarios relevant to their specific jobs' },
  { phase: 'optimization', order: 4, title: 'Address Fear & Resistance', description: 'Have open conversations about job security and the role of AI as an assistant, not a replacement; build psychological safety' },
  { phase: 'optimization', order: 5, title: 'Assign AI Champions', description: 'Identify one or two motivated employees to serve as internal go-to resources for AI questions and adoption support' },
  { phase: 'optimization', order: 6, title: 'Create a Feedback Loop', description: 'Establish a simple way for staff to report issues, suggest improvements, and share what\'s working well with AI tools' },

  // Phase 6: Monitoring, Optimization & Ongoing Support
  { phase: 'maintenance', order: 1, title: 'Review KPIs vs. Baseline', description: 'Compare current performance metrics to pre-AI baselines; document wins and identify underperforming areas' },
  { phase: 'maintenance', order: 2, title: 'Optimize Underperforming Tools', description: 'Tweak prompts, workflows, or settings for any AI tool not delivering expected results; A/B test alternatives' },
  { phase: 'maintenance', order: 3, title: 'Identify New Automation Opportunities', description: 'As the team gets comfortable, find the next wave of processes to automate or AI tools to introduce' },
  { phase: 'maintenance', order: 4, title: 'Deliver Monthly Performance Report', description: "Produce a clean report showing ROI, time saved, revenue impact, and recommendations for the client's records" },
  { phase: 'maintenance', order: 5, title: 'Conduct Quarterly Strategy Review', description: 'Meet with the client every 90 days to reassess goals, review the AI landscape, and plan the next phase of growth' },
  { phase: 'maintenance', order: 6, title: 'Manage Ongoing Retainer or Close Out', description: 'Either transition the client to a monthly support retainer or formally close the engagement with a final report and handoff' },
];

export const PHASE_INFO: Record<Phase, { label: string; description: string; color: string; short: string }> = {
  discovery: { label: 'First Contact & Business Discovery', description: 'From initial outreach to understanding the business landscape', color: '#0d8fff', short: 'P1' },
  strategy: { label: 'Business Audit & AI Opportunity Assessment', description: 'Deep dive into processes and identify AI opportunities', color: '#7c3aed', short: 'P2' },
  implementation: { label: 'Strategy & AI Roadmap Development', description: 'Build the implementation plan and get buy-in', color: '#f59e0b', short: 'P3' },
  review: { label: 'Tool Setup & AI Integration', description: 'Configure and connect AI tools to business systems', color: '#10b981', short: 'P4' },
  optimization: { label: 'Team Training & Change Management', description: 'Prepare the team for AI-powered workflows', color: '#ef4444', short: 'P5' },
  maintenance: { label: 'Monitoring, Optimization & Ongoing Support', description: 'Track performance and continuously improve', color: '#06b6d4', short: 'P6' },
};
