// Harbor Seed Prompts - SaaS Category
// 125 prompts across 13 subcategories
// Location: lib/seed-prompts.ts

export interface SeedPrompt {
  prompt_text: string
  topic: string
  intent: 'buying' | 'comparison' | 'use_case' | 'switching'
}

export const SEED_PROMPTS: SeedPrompt[] = [
  // ============================================
  // PROJECT MANAGEMENT (10 prompts)
  // ============================================
  { prompt_text: "What's the best project management software for small teams?", topic: "Project Management", intent: "buying" },
  { prompt_text: "Asana vs Monday.com vs ClickUp - which should I choose?", topic: "Project Management", intent: "comparison" },
  { prompt_text: "Best project management tool for remote teams", topic: "Project Management", intent: "buying" },
  { prompt_text: "What project management software do startups use?", topic: "Project Management", intent: "buying" },
  { prompt_text: "Notion vs Asana for project management", topic: "Project Management", intent: "comparison" },
  { prompt_text: "Best free project management tools in 2025", topic: "Project Management", intent: "buying" },
  { prompt_text: "What's better for agile teams - Jira or Linear?", topic: "Project Management", intent: "comparison" },
  { prompt_text: "Best project management app for creative agencies", topic: "Project Management", intent: "use_case" },
  { prompt_text: "Alternatives to Basecamp for project management", topic: "Project Management", intent: "switching" },
  { prompt_text: "Which project management tool has the best Gantt charts?", topic: "Project Management", intent: "buying" },

  // ============================================
  // CRM & SALES (10 prompts)
  // ============================================
  { prompt_text: "Best CRM for small businesses", topic: "CRM & Sales", intent: "buying" },
  { prompt_text: "Salesforce vs HubSpot CRM - which is better?", topic: "CRM & Sales", intent: "comparison" },
  { prompt_text: "What CRM do most startups use?", topic: "CRM & Sales", intent: "buying" },
  { prompt_text: "Best free CRM software", topic: "CRM & Sales", intent: "buying" },
  { prompt_text: "Pipedrive vs Close CRM for sales teams", topic: "CRM & Sales", intent: "comparison" },
  { prompt_text: "Best CRM for real estate agents", topic: "CRM & Sales", intent: "use_case" },
  { prompt_text: "Alternatives to Salesforce that are cheaper", topic: "CRM & Sales", intent: "switching" },
  { prompt_text: "What's the best CRM for B2B sales?", topic: "CRM & Sales", intent: "buying" },
  { prompt_text: "HubSpot vs Zoho CRM comparison", topic: "CRM & Sales", intent: "comparison" },
  { prompt_text: "Best CRM with email integration", topic: "CRM & Sales", intent: "buying" },

  // ============================================
  // MARKETING & SEO (10 prompts)
  // ============================================
  { prompt_text: "Best SEO tools for small businesses", topic: "Marketing & SEO", intent: "buying" },
  { prompt_text: "Ahrefs vs SEMrush - which SEO tool is better?", topic: "Marketing & SEO", intent: "comparison" },
  { prompt_text: "What email marketing software should I use?", topic: "Marketing & SEO", intent: "buying" },
  { prompt_text: "Mailchimp vs Klaviyo for e-commerce", topic: "Marketing & SEO", intent: "comparison" },
  { prompt_text: "Best social media scheduling tools", topic: "Marketing & SEO", intent: "buying" },
  { prompt_text: "Buffer vs Hootsuite vs Later - which is best?", topic: "Marketing & SEO", intent: "comparison" },
  { prompt_text: "Best marketing automation platform for startups", topic: "Marketing & SEO", intent: "buying" },
  { prompt_text: "Alternatives to Mailchimp for email marketing", topic: "Marketing & SEO", intent: "switching" },
  { prompt_text: "What's the best keyword research tool?", topic: "Marketing & SEO", intent: "buying" },
  { prompt_text: "Best tools for tracking website analytics", topic: "Marketing & SEO", intent: "buying" },

  // ============================================
  // HR & RECRUITING (10 prompts)
  // ============================================
  { prompt_text: "Best applicant tracking system for small companies", topic: "HR & Recruiting", intent: "buying" },
  { prompt_text: "Greenhouse vs Lever for recruiting", topic: "HR & Recruiting", intent: "comparison" },
  { prompt_text: "Best HR software for startups", topic: "HR & Recruiting", intent: "buying" },
  { prompt_text: "What payroll software do small businesses use?", topic: "HR & Recruiting", intent: "buying" },
  { prompt_text: "Gusto vs Rippling for payroll", topic: "HR & Recruiting", intent: "comparison" },
  { prompt_text: "Best employee onboarding software", topic: "HR & Recruiting", intent: "buying" },
  { prompt_text: "BambooHR vs Workday comparison", topic: "HR & Recruiting", intent: "comparison" },
  { prompt_text: "Best performance review software", topic: "HR & Recruiting", intent: "buying" },
  { prompt_text: "Alternatives to ADP for small business payroll", topic: "HR & Recruiting", intent: "switching" },
  { prompt_text: "What's the best HRIS for a 50 person company?", topic: "HR & Recruiting", intent: "use_case" },

  // ============================================
  // FINANCE & ACCOUNTING (10 prompts)
  // ============================================
  { prompt_text: "Best accounting software for small businesses", topic: "Finance & Accounting", intent: "buying" },
  { prompt_text: "QuickBooks vs Xero - which is better?", topic: "Finance & Accounting", intent: "comparison" },
  { prompt_text: "Best invoicing software for freelancers", topic: "Finance & Accounting", intent: "buying" },
  { prompt_text: "FreshBooks vs Wave accounting comparison", topic: "Finance & Accounting", intent: "comparison" },
  { prompt_text: "Best expense tracking app for businesses", topic: "Finance & Accounting", intent: "buying" },
  { prompt_text: "What accounting software do startups use?", topic: "Finance & Accounting", intent: "buying" },
  { prompt_text: "Brex vs Ramp for corporate cards", topic: "Finance & Accounting", intent: "comparison" },
  { prompt_text: "Best financial planning software for SaaS", topic: "Finance & Accounting", intent: "use_case" },
  { prompt_text: "Alternatives to QuickBooks Online", topic: "Finance & Accounting", intent: "switching" },
  { prompt_text: "Best accounts payable automation software", topic: "Finance & Accounting", intent: "buying" },

  // ============================================
  // COMMUNICATION & COLLABORATION (10 prompts)
  // ============================================
  { prompt_text: "Best team communication tools", topic: "Communication", intent: "buying" },
  { prompt_text: "Slack vs Microsoft Teams - which should I use?", topic: "Communication", intent: "comparison" },
  { prompt_text: "Best video conferencing software for business", topic: "Communication", intent: "buying" },
  { prompt_text: "Zoom vs Google Meet vs Teams comparison", topic: "Communication", intent: "comparison" },
  { prompt_text: "Best async communication tools for remote teams", topic: "Communication", intent: "buying" },
  { prompt_text: "Loom vs Vidyard for video messaging", topic: "Communication", intent: "comparison" },
  { prompt_text: "Alternatives to Slack for team chat", topic: "Communication", intent: "switching" },
  { prompt_text: "Best internal wiki software for companies", topic: "Communication", intent: "buying" },
  { prompt_text: "Notion vs Confluence for team documentation", topic: "Communication", intent: "comparison" },
  { prompt_text: "What collaboration tools do tech companies use?", topic: "Communication", intent: "buying" },

  // ============================================
  // DESIGN & CREATIVE (10 prompts)
  // ============================================
  { prompt_text: "Best design tools for non-designers", topic: "Design & Creative", intent: "buying" },
  { prompt_text: "Figma vs Sketch vs Adobe XD comparison", topic: "Design & Creative", intent: "comparison" },
  { prompt_text: "Best graphic design software for beginners", topic: "Design & Creative", intent: "buying" },
  { prompt_text: "Canva vs Adobe Express - which is better?", topic: "Design & Creative", intent: "comparison" },
  { prompt_text: "Best prototyping tools for product teams", topic: "Design & Creative", intent: "buying" },
  { prompt_text: "What design tools do startups use?", topic: "Design & Creative", intent: "buying" },
  { prompt_text: "Best whiteboard software for brainstorming", topic: "Design & Creative", intent: "buying" },
  { prompt_text: "Miro vs FigJam vs Mural comparison", topic: "Design & Creative", intent: "comparison" },
  { prompt_text: "Alternatives to Adobe Creative Cloud", topic: "Design & Creative", intent: "switching" },
  { prompt_text: "Best video editing software for marketing teams", topic: "Design & Creative", intent: "buying" },

  // ============================================
  // DEVELOPER TOOLS (10 prompts)
  // ============================================
  { prompt_text: "Best code editors for web development", topic: "Developer Tools", intent: "buying" },
  { prompt_text: "VS Code vs WebStorm vs Sublime comparison", topic: "Developer Tools", intent: "comparison" },
  { prompt_text: "Best CI/CD tools for small teams", topic: "Developer Tools", intent: "buying" },
  { prompt_text: "GitHub Actions vs CircleCI vs Jenkins", topic: "Developer Tools", intent: "comparison" },
  { prompt_text: "Best error tracking tools for developers", topic: "Developer Tools", intent: "buying" },
  { prompt_text: "Sentry vs Datadog vs New Relic comparison", topic: "Developer Tools", intent: "comparison" },
  { prompt_text: "Best API testing tools", topic: "Developer Tools", intent: "buying" },
  { prompt_text: "Postman vs Insomnia for API development", topic: "Developer Tools", intent: "comparison" },
  { prompt_text: "What hosting platform should I use for my startup?", topic: "Developer Tools", intent: "buying" },
  { prompt_text: "Vercel vs Netlify vs AWS for web apps", topic: "Developer Tools", intent: "comparison" },

  // ============================================
  // CUSTOMER SUPPORT (10 prompts)
  // ============================================
  { prompt_text: "Best help desk software for small businesses", topic: "Customer Support", intent: "buying" },
  { prompt_text: "Zendesk vs Intercom vs Freshdesk comparison", topic: "Customer Support", intent: "comparison" },
  { prompt_text: "Best live chat software for websites", topic: "Customer Support", intent: "buying" },
  { prompt_text: "Intercom vs Drift for customer messaging", topic: "Customer Support", intent: "comparison" },
  { prompt_text: "Best customer support ticketing system", topic: "Customer Support", intent: "buying" },
  { prompt_text: "What support tools do SaaS companies use?", topic: "Customer Support", intent: "buying" },
  { prompt_text: "Best knowledge base software", topic: "Customer Support", intent: "buying" },
  { prompt_text: "Alternatives to Zendesk that are cheaper", topic: "Customer Support", intent: "switching" },
  { prompt_text: "Best AI chatbot for customer service", topic: "Customer Support", intent: "buying" },
  { prompt_text: "Help Scout vs Front for customer support", topic: "Customer Support", intent: "comparison" },

  // ============================================
  // E-COMMERCE (10 prompts)
  // ============================================
  { prompt_text: "Best e-commerce platform for small businesses", topic: "E-commerce", intent: "buying" },
  { prompt_text: "Shopify vs WooCommerce vs BigCommerce comparison", topic: "E-commerce", intent: "comparison" },
  { prompt_text: "Best payment processing for online stores", topic: "E-commerce", intent: "buying" },
  { prompt_text: "Stripe vs PayPal vs Square for e-commerce", topic: "E-commerce", intent: "comparison" },
  { prompt_text: "Best inventory management software", topic: "E-commerce", intent: "buying" },
  { prompt_text: "What platform should I use to sell online?", topic: "E-commerce", intent: "buying" },
  { prompt_text: "Best subscription billing software", topic: "E-commerce", intent: "buying" },
  { prompt_text: "Shopify vs Squarespace for selling products", topic: "E-commerce", intent: "comparison" },
  { prompt_text: "Alternatives to Shopify for dropshipping", topic: "E-commerce", intent: "switching" },
  { prompt_text: "Best e-commerce analytics tools", topic: "E-commerce", intent: "buying" },

  // ============================================
  // ANALYTICS & BI (10 prompts)
  // ============================================
  { prompt_text: "Best business intelligence tools for startups", topic: "Analytics & BI", intent: "buying" },
  { prompt_text: "Tableau vs Power BI vs Looker comparison", topic: "Analytics & BI", intent: "comparison" },
  { prompt_text: "Best product analytics tools", topic: "Analytics & BI", intent: "buying" },
  { prompt_text: "Mixpanel vs Amplitude vs Heap comparison", topic: "Analytics & BI", intent: "comparison" },
  { prompt_text: "Best Google Analytics alternatives", topic: "Analytics & BI", intent: "switching" },
  { prompt_text: "What analytics tools do SaaS companies use?", topic: "Analytics & BI", intent: "buying" },
  { prompt_text: "Best dashboard software for business metrics", topic: "Analytics & BI", intent: "buying" },
  { prompt_text: "Metabase vs Redash for data visualization", topic: "Analytics & BI", intent: "comparison" },
  { prompt_text: "Best customer data platform for e-commerce", topic: "Analytics & BI", intent: "use_case" },
  { prompt_text: "Segment vs RudderStack comparison", topic: "Analytics & BI", intent: "comparison" },

  // ============================================
  // SECURITY & COMPLIANCE (8 prompts)
  // ============================================
  { prompt_text: "Best password manager for businesses", topic: "Security", intent: "buying" },
  { prompt_text: "1Password vs LastPass vs Dashlane for teams", topic: "Security", intent: "comparison" },
  { prompt_text: "Best SSO solution for startups", topic: "Security", intent: "buying" },
  { prompt_text: "Okta vs Auth0 for authentication", topic: "Security", intent: "comparison" },
  { prompt_text: "Best VPN for business use", topic: "Security", intent: "buying" },
  { prompt_text: "What security tools do startups need?", topic: "Security", intent: "buying" },
  { prompt_text: "Best SOC 2 compliance software", topic: "Security", intent: "buying" },
  { prompt_text: "Vanta vs Drata for compliance automation", topic: "Security", intent: "comparison" },

  // ============================================
  // AI & AUTOMATION (7 prompts)
  // ============================================
  { prompt_text: "Best AI writing tools for content marketing", topic: "AI & Automation", intent: "buying" },
  { prompt_text: "Jasper vs Copy.ai vs ChatGPT for writing", topic: "AI & Automation", intent: "comparison" },
  { prompt_text: "Best workflow automation tools", topic: "AI & Automation", intent: "buying" },
  { prompt_text: "Zapier vs Make vs n8n comparison", topic: "AI & Automation", intent: "comparison" },
  { prompt_text: "Best AI tools for sales teams", topic: "AI & Automation", intent: "buying" },
  { prompt_text: "What AI tools are businesses actually using?", topic: "AI & Automation", intent: "buying" },
  { prompt_text: "Best no-code automation platforms", topic: "AI & Automation", intent: "buying" },
]

export const PROMPT_STATS = {
  total: 125,
  categories: 13,
  byIntent: {
    buying: 68,
    comparison: 45,
    use_case: 6,
    switching: 6
  }
}

export const TOPICS = [
  "Project Management",
  "CRM & Sales", 
  "Marketing & SEO",
  "HR & Recruiting",
  "Finance & Accounting",
  "Communication",
  "Design & Creative",
  "Developer Tools",
  "Customer Support",
  "E-commerce",
  "Analytics & BI",
  "Security",
  "AI & Automation"
]
