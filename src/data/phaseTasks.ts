import { Phase } from '../types';

export interface PhaseTemplate {
  phase: Phase;
  phaseNumber: number;
  title: string;
  description: string;
  color: string;
  tasks: TaskTemplate[];
}

export interface TaskTemplate {
  title: string;
  description: string;
  aiPromptHint: string;
}

export const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    phase: 'discovery',
    phaseNumber: 1,
    title: 'First Contact & Business Discovery',
    description: 'From initial outreach to understanding the business landscape',
    color: '#0d8fff',
    tasks: [
      {
        title: 'Initial Outreach / Intro Call',
        description: 'Introduce yourself and your services; briefly explain how AI can benefit small businesses without overwhelming the owner',
        aiPromptHint: 'intro call script',
      },
      {
        title: 'Understand the Business',
        description: 'Ask foundational questions: What do you sell? Who are your customers? How many employees? What does a typical day look like?',
        aiPromptHint: 'business discovery questions',
      },
      {
        title: 'Identify Pain Points',
        description: 'Dig into where time is wasted, where mistakes happen, what tasks are repetitive, and what keeps the owner up at night',
        aiPromptHint: 'pain point analysis',
      },
      {
        title: 'Assess Tech Comfort Level',
        description: "Gauge the owner's and team's familiarity with technology; identify any resistance or fear around AI adoption",
        aiPromptHint: 'tech assessment',
      },
      {
        title: 'Review Current Tools & Software',
        description: 'Inventory all existing software, apps, and platforms the business uses (POS, CRM, email, scheduling, accounting, etc.)',
        aiPromptHint: 'tools audit',
      },
      {
        title: 'Define Goals & Success Metrics',
        description: 'Establish what success looks like: time saved, revenue increased, errors reduced, customer satisfaction improved',
        aiPromptHint: 'goals and KPIs',
      },
      {
        title: 'Sign Consulting Agreement / NDA',
        description: 'Execute a consulting services agreement and NDA to protect both parties before sharing sensitive business information',
        aiPromptHint: 'consulting agreement',
      },
    ],
  },
  {
    phase: 'strategy',
    phaseNumber: 2,
    title: 'Business Audit & AI Opportunity Assessment',
    description: 'Deep dive into processes and identify AI opportunities',
    color: '#bf5af2',
    tasks: [
      {
        title: 'Map Core Business Processes',
        description: 'Document the end-to-end workflows for sales, operations, customer service, and admin',
        aiPromptHint: 'process mapping',
      },
      {
        title: 'Identify Automation Opportunities',
        description: 'Pinpoint repetitive, rule-based tasks that AI or automation can handle: scheduling, follow-ups, invoicing, data entry',
        aiPromptHint: 'automation opportunities',
      },
      {
        title: 'Research AI Solutions',
        description: 'Match identified pain points with specific AI tools, platforms, and services appropriate for the business size and budget',
        aiPromptHint: 'AI tool recommendations',
      },
      {
        title: 'Evaluate ROI Potential',
        description: 'Estimate time savings, cost reductions, and revenue opportunities for each proposed AI solution',
        aiPromptHint: 'ROI analysis',
      },
      {
        title: 'Prioritize Opportunities',
        description: 'Rank AI opportunities by impact vs. effort; identify quick wins vs. long-term strategic plays',
        aiPromptHint: 'prioritization matrix',
      },
      {
        title: 'Present Audit Findings',
        description: 'Deliver a clear, jargon-free report of findings and recommendations to the business owner',
        aiPromptHint: 'audit presentation',
      },
      {
        title: 'Get Buy-in on Approach',
        description: 'Align on priorities, budget, and timeline before moving to strategy development',
        aiPromptHint: 'stakeholder buy-in',
      },
      {
        title: 'Define Implementation Budget',
        description: 'Establish budget for AI tools, integrations, training, and ongoing support',
        aiPromptHint: 'budget planning',
      },
    ],
  },
  {
    phase: 'implementation',
    phaseNumber: 3,
    title: 'Strategy & AI Roadmap Development',
    description: 'Build the implementation plan and get buy-in',
    color: '#ff9f0a',
    tasks: [
      {
        title: 'Create 90-Day AI Roadmap',
        description: 'Build a phased implementation plan with clear milestones, owners, and timelines',
        aiPromptHint: '90-day roadmap',
      },
      {
        title: 'Select AI Tools & Vendors',
        description: 'Finalize tool selection based on audit findings, budget, and integration requirements',
        aiPromptHint: 'vendor selection',
      },
      {
        title: 'Design Integration Architecture',
        description: 'Map out how new AI tools will connect with existing systems and workflows',
        aiPromptHint: 'integration architecture',
      },
      {
        title: 'Create Change Management Plan',
        description: 'Plan for staff communication, training, and adoption to minimize resistance',
        aiPromptHint: 'change management',
      },
      {
        title: 'Set Up Success Tracking',
        description: 'Define KPIs and establish baseline measurements before implementation begins',
        aiPromptHint: 'KPI tracking setup',
      },
      {
        title: 'Present Final Strategy',
        description: 'Present the complete AI roadmap and get final sign-off before execution begins',
        aiPromptHint: 'strategy presentation',
      },
    ],
  },
  {
    phase: 'review',
    phaseNumber: 4,
    title: 'Tool Setup & AI Integration',
    description: 'Configure and connect AI tools to business systems',
    color: '#30d158',
    tasks: [
      {
        title: 'Set Up AI Accounts & Subscriptions',
        description: 'Create and configure accounts for approved AI tools; ensure billing, access, and security are properly configured',
        aiPromptHint: 'account setup checklist',
      },
      {
        title: 'Connect AI Tools to Existing Systems',
        description: 'Integrate AI tools with current software via APIs, Zapier, Make, or native integrations',
        aiPromptHint: 'integration guide',
      },
      {
        title: 'Build Automation Workflows',
        description: 'Design and activate automated workflows: lead follow-up sequences, appointment reminders, invoice generation, data entry',
        aiPromptHint: 'automation workflows',
      },
      {
        title: 'Configure AI Communication Tools',
        description: "Set up AI chatbots, email responders, or voice assistants trained on the business's tone, FAQs, and product info",
        aiPromptHint: 'communication tools setup',
      },
      {
        title: 'Implement AI Content Generation',
        description: 'Set up AI writing workflows for social media, email newsletters, product descriptions, and ad copy creation',
        aiPromptHint: 'content generation setup',
      },
    ],
  },
  {
    phase: 'optimization',
    phaseNumber: 5,
    title: 'Team Training & Change Management',
    description: 'Prepare the team for AI-powered workflows',
    color: '#ff453a',
    tasks: [
      {
        title: 'Assess Team Roles & AI Impact',
        description: 'Identify which employees will use AI tools directly and how their daily responsibilities will shift',
        aiPromptHint: 'team impact assessment',
      },
      {
        title: 'Develop Training Materials',
        description: 'Create simple, role-specific guides, cheat sheets, and video walkthroughs tailored to each AI tool',
        aiPromptHint: 'training materials',
      },
      {
        title: 'Conduct Live Training Sessions',
        description: 'Lead hands-on training with staff; demonstrate tools in real scenarios relevant to their specific jobs',
        aiPromptHint: 'training session plan',
      },
      {
        title: 'Address Fear & Resistance',
        description: 'Have open conversations about job security and the role of AI as an assistant, not a replacement',
        aiPromptHint: 'resistance management',
      },
      {
        title: 'Assign AI Champions',
        description: 'Identify one or two motivated employees to serve as internal go-to resources for AI questions and adoption support',
        aiPromptHint: 'champion program',
      },
      {
        title: 'Create a Feedback Loop',
        description: 'Establish a simple way for staff to report issues, suggest improvements, and share what is working well',
        aiPromptHint: 'feedback system',
      },
    ],
  },
  {
    phase: 'maintenance',
    phaseNumber: 6,
    title: 'Monitoring, Optimization & Ongoing Support',
    description: 'Track performance and continuously improve',
    color: '#64d2ff',
    tasks: [
      {
        title: 'Review KPI Performance',
        description: 'Analyze actual results vs. baseline measurements; document wins and areas needing improvement',
        aiPromptHint: 'KPI review report',
      },
      {
        title: 'Optimize Underperforming Workflows',
        description: 'Identify automations or AI tools not delivering expected results and troubleshoot or replace them',
        aiPromptHint: 'optimization plan',
      },
      {
        title: 'Expand Successful Implementations',
        description: 'Scale AI tools and workflows that are working well to additional departments or use cases',
        aiPromptHint: 'expansion roadmap',
      },
      {
        title: 'Monthly Check-in & Report',
        description: 'Deliver a monthly performance summary and strategic recommendations to the business owner',
        aiPromptHint: 'monthly report',
      },
      {
        title: 'Stay Current on AI Developments',
        description: 'Monitor new AI tools and updates relevant to the business; recommend upgrades as needed',
        aiPromptHint: 'AI trends update',
      },
      {
        title: 'Plan Next Phase of AI Adoption',
        description: 'Identify the next wave of AI opportunities based on business growth and evolving needs',
        aiPromptHint: 'next phase planning',
      },
    ],
  },
];

export const PHASE_COLORS: Record<Phase, string> = {
  discovery: '#0d8fff',
  strategy: '#bf5af2',
  implementation: '#ff9f0a',
  review: '#30d158',
  optimization: '#ff453a',
  maintenance: '#64d2ff',
};
