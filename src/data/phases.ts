import { Phase } from '../types';

export interface DefaultTask {
  title: string;
  description: string;
}

export interface PhaseData {
  id: Phase;
  label: string;
  subtitle: string;
  color: string;
  tasks: DefaultTask[];
}

export const PHASES: PhaseData[] = [
  {
    id: 'discovery',
    label: 'First Contact & Business Discovery',
    subtitle: 'From initial outreach to understanding the business landscape',
    color: '#3b82f6',
    tasks: [
      { title: 'Initial Outreach / Intro Call', description: 'Introduce yourself and your services; briefly explain how AI can benefit small businesses without overwhelming the owner' },
      { title: 'Understand the Business', description: 'Ask foundational questions: What do you sell? Who are your customers? How many employees? What does a typical day look like?' },
      { title: 'Identify Pain Points', description: 'Dig into where time is wasted, where mistakes happen, what tasks are repetitive, and what keeps the owner up at night' },
      { title: 'Assess Tech Comfort Level', description: "Gauge the owner's and team's familiarity with technology; identify any resistance or fear around AI adoption" },
      { title: 'Review Current Tools & Software', description: 'Inventory all existing software, apps, and platforms the business uses (POS, CRM, email, scheduling, accounting, etc.)' },
      { title: 'Define Goals & Success Metrics', description: 'Establish what success looks like: time saved, revenue increased, errors reduced, customer satisfaction improved' },
      { title: 'Sign Consulting Agreement / NDA', description: 'Execute a consulting services agreement and NDA to protect both parties before sharing sensitive business information' },
    ],
  },
  {
    id: 'strategy',
    label: 'Business Audit & AI Opportunity Assessment',
    subtitle: 'Deep dive into processes and identify AI opportunities',
    color: '#8b5cf6',
    tasks: [
      { title: 'Map Current Workflows', description: 'Document step-by-step how key business processes work today' },
      { title: 'Identify Automation Opportunities', description: 'Highlight repetitive, rule-based tasks that AI can handle: scheduling, data entry, email responses, invoicing, reporting' },
      { title: 'Assess Data Availability', description: "Evaluate what data the business has and whether it's clean enough to use for AI training or analysis" },
      { title: 'Competitive AI Landscape Review', description: 'Research how competitors or industry leaders are using AI; identify gaps and opportunities' },
      { title: 'Calculate ROI Potential', description: 'Estimate time savings, cost reduction, and revenue potential for each AI opportunity identified' },
      { title: 'Prioritize AI Initiatives', description: 'Rank opportunities by impact, cost, and ease of implementation; create a phased roadmap starting with quick wins' },
      { title: 'Present Audit Findings', description: 'Walk the client through findings, opportunities, and your recommended AI roadmap with clear next steps' },
      { title: 'Get Client Sign-off on Roadmap', description: 'Obtain written approval on the proposed AI strategy and implementation plan before moving forward' },
    ],
  },
  {
    id: 'implementation',
    label: 'Strategy & AI Roadmap Development',
    subtitle: 'Build the implementation plan and get buy-in',
    color: '#f59e0b',
    tasks: [
      { title: 'Select AI Tools & Vendors', description: 'Choose specific AI tools for each initiative based on budget, tech stack compatibility, ease of use, and support quality' },
      { title: 'Create Implementation Timeline', description: 'Build a detailed project plan with milestones, deadlines, and dependencies for each AI tool rollout' },
      { title: 'Define Success KPIs', description: 'Set measurable key performance indicators for each AI initiative so progress can be tracked and reported' },
      { title: 'Budget & Resource Planning', description: 'Finalize costs for tools, integrations, training, and ongoing support; get budget approval from the client' },
      { title: 'Stakeholder Communication Plan', description: 'Prepare messaging for employees, partners, and customers about upcoming AI changes to minimize resistance' },
      { title: 'Risk Assessment & Mitigation', description: 'Identify potential risks (data privacy, system downtime, employee pushback) and create contingency plans' },
    ],
  },
  {
    id: 'review',
    label: 'Tool Setup & AI Integration',
    subtitle: 'Configure and connect AI tools to business systems',
    color: '#10b981',
    tasks: [
      { title: 'Set Up AI Accounts & Subscriptions', description: 'Create and configure accounts for approved AI tools; ensure billing, access, and security settings are properly configured' },
      { title: 'Connect AI Tools to Existing Systems', description: 'Integrate AI tools with current software via APIs, Zapier, Make, or native integrations' },
      { title: 'Build Automation Workflows', description: 'Design and activate automated workflows: lead follow-up sequences, appointment reminders, invoice generation, data entry' },
      { title: 'Configure AI Communication Tools', description: "Set up AI chatbots, email responders, or voice assistants trained on the business's tone, FAQs, and product info" },
      { title: 'Implement AI Content Generation', description: 'Set up AI writing workflows for social media, email newsletters, product descriptions, and ad copy creation' },
    ],
  },
  {
    id: 'optimization',
    label: 'Team Training & Change Management',
    subtitle: 'Prepare the team for AI-powered workflows',
    color: '#ef4444',
    tasks: [
      { title: 'Assess Team Roles & AI Impact', description: 'Identify which employees will use AI tools directly and how their daily responsibilities will shift' },
      { title: 'Develop Training Materials', description: 'Create simple, role-specific guides, cheat sheets, and video walkthroughs tailored to each AI tool being introduced' },
      { title: 'Conduct Live Training Sessions', description: 'Lead hands-on training with staff; demonstrate tools in real scenarios relevant to their specific jobs' },
      { title: 'Address Fear & Resistance', description: 'Have open conversations about job security and the role of AI as an assistant, not a replacement; build psychological safety' },
      { title: 'Assign AI Champions', description: 'Identify one or two motivated employees to serve as internal go-to resources for AI questions and adoption support' },
      { title: 'Create a Feedback Loop', description: 'Establish a simple way for staff to report issues, suggest improvements, and share what is working well with AI tools' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Monitoring, Optimization & Ongoing Support',
    subtitle: 'Track performance and continuously improve',
    color: '#06b6d4',
    tasks: [
      { title: 'Set Up Performance Dashboards', description: 'Create simple dashboards or reports to track KPIs: time saved, leads generated, revenue attributed to AI tools' },
      { title: 'Monthly Check-in Calls', description: 'Schedule regular calls to review performance, address issues, and identify new optimization opportunities' },
      { title: 'Optimize Underperforming Tools', description: "Analyze tools that aren't delivering expected results; adjust configurations, prompts, or workflows as needed" },
      { title: 'Identify New AI Opportunities', description: 'As the business grows and AI evolves, continuously scout for new tools and use cases that could benefit the client' },
      { title: 'Update & Retrain AI Systems', description: 'Keep AI tools current with new business information, product updates, pricing changes, and seasonal adjustments' },
      { title: 'Produce ROI Reports', description: 'Create quarterly reports showing concrete results and ROI from AI implementations to justify ongoing retainer' },
    ],
  },
];

export const PHASE_COLORS: Record<Phase, string> = {
  discovery: '#3b82f6',
  strategy: '#8b5cf6',
  implementation: '#f59e0b',
  review: '#10b981',
  optimization: '#ef4444',
  maintenance: '#06b6d4',
};
