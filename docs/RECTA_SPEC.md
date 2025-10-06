RECTA - COMPLETE OVERVIEW (v2.0 - Simplified Architecture)

1. VISION & POSITIONING
One-Liner:
"AI-powered organizational intelligence for growth companies that can't afford McKinsey"
The Problem:

Growth companies (20-250 people) need professional org design
Consultants cost €50k-200k and take months
HR systems only store data, provide no intelligence
Founders guess and make expensive mistakes (€100k+ per wrong hire)

The Solution:
AI copilot that:

Challenges your assumptions (like a consultant)
Analyzes 100,000+ companies in real-time (like Mercer)
Gives concrete recommendations in minutes (not months)
Costs €200/month instead of €50k per project

Category Design:
Not "cheaper consulting" - new category: AI-Powered Organizational Intelligence
Timing:

AI makes this possible only now (2024-2025)
EU Pay Transparency Directive (June 2026) = forced adoption
Consultants can't cannibalize their business model


2. PRODUCT ARCHITECTURE
A. Core Interface: "Conversation + Canvas"
┌─────────────────────────────────────────────────┐
│  RECTA                            [Settings] [?] │
├────────────────┬────────────────────────────────┤
│                │                                 │
│  CHAT (30%)    │    CANVAS (70%)                │
│                │                                 │
│  AI Coach      │    Live Visualizations:        │
│  converses     │    - Org charts                │
│  here          │    - Scenarios                 │
│                │    - Benchmarks                │
│  [Input box]   │    - Cost analysis             │
│                │    - Research process          │
│                │                                 │
└────────────────┴────────────────────────────────┘
Two sides work together:

Left: Natural conversation (like ChatGPT)
Right: Visual intelligence (animates live during conversation)


B. Conversation Engine: "Socratic AI Coach"
Four phases (structured but flexible):
PHASE 1: CONTEXT (5 min)
├─ Company size, location, stage, industry
├─ Current team structure  
├─ Funding/budget situation
└─ Growth trajectory

PHASE 2: PROBLEM DISCOVERY (5-10 min)
├─ What is the actual problem? (not surface symptom)
├─ Why now? (timing/urgency)
├─ What have you tried?
└─ What assumptions are you making?

PHASE 3: SOLUTION DESIGN (10 min)
├─ AI research (live on canvas)
├─ 3+ scenarios to compare
├─ Benchmarks & data
└─ Guided decision-making

PHASE 4: ACTION PLAN (5 min)
├─ Concrete roadmap
├─ Deliverables (JDs, comp ranges, etc)
├─ Success metrics
└─ Next steps
Transitions between phases:
"Good! Now we understand the current state. 
 Let's dig deeper into WHAT is blocking..."

"Perfect - enough info now.
 Give me 20 seconds to analyze 827 similar companies..."

"Okay, you seem to lean toward solution A - smart!
 Final step: Let's make this concrete..."
Key: Feels like natural conversation, not a form

C. Intelligence Layer: "Smart Stateful Conversation"
Instead of multi-agent system, we use:
┌──────────────────────────────────────────────────┐
│  SINGLE CLAUDE CALL (with extended thinking)      │
├──────────────────────────────────────────────────┤
│                                                   │
│  INPUT:                                          │
│  ├─ User message                                 │
│  ├─ Conversation state (structured JSON)         │
│  └─ Smart system prompt                          │
│                                                   │
│  CLAUDE'S INTERNAL PROCESS:                      │
│  (happens in one call, with thinking)            │
│  ├─ Analyzes what user said                      │
│  ├─ Updates conversation state                   │
│  ├─ Detects contradictions/vagueness             │
│  ├─ Determines next phase/action                 │
│  └─ Generates response + canvas instructions     │
│                                                   │
│  OUTPUT (structured JSON):                       │
│  {                                               │
│    "response": "text to show user",              │
│    "conversationState": {...},                   │
│    "canvasAction": "show_org_chart",             │
│    "canvasData": {...},                          │
│    "phase": "problem_discovery",                 │
│    "confidence": 0.85                            │
│  }                                               │
│                                                   │
└──────────────────────────────────────────────────┘
Conversation State Structure:
typescripttype ConversationState = {
  // CONTEXT
  company: {
    name?: string
    size?: number
    industry?: string
    location?: string
    stage?: "seed" | "seriesA" | "seriesB" | "growth"
    funding?: number
  }
  
  // PROBLEM
  problem: {
    summary?: string
    rootCause?: string
    urgency?: "low" | "medium" | "high"
    constraints?: string[]
  }
  
  // CLAIMS (what user has said)
  claims: Array<{
    statement: string
    confidence: "certain" | "uncertain" | "conflicting"
    timestamp: Date
  }>
  
  // PHASE TRACKING
  currentPhase: "context" | "problem" | "solution" | "action"
  phaseProgress: {
    context: number      // 0-100%
    problem: number
    solution: number
    action: number
  }
  
  // QUALITY SIGNALS
  quality: {
    hasContradictions: boolean
    vaguenessScore: number     // 0-100
    missingInfo: string[]
    readyToAdvance: boolean
  }
  
  // SOLUTION SPACE
  scenarios?: Array<{
    name: string
    description: string
    pros: string[]
    cons: string[]
    cost: number
  }>
  
  // DELIVERABLES
  deliverables: {
    orgChart?: string          // Mermaid markdown
    jobDescriptions?: Array<{...}>
    timeline?: Array<{...}>
  }
}
Benefits vs Multi-Agent:

5x cheaper (1 API call instead of 5)
Faster (no sequential coordination)
Easier to debug (one response to inspect)
More flexible (natural conversation flow)
Same quality (Claude does analysis internally)


D. Canvas Visualizations (8 types)
1. Live Org Builder
Shows: Current org → Proposed org (morphs in real-time)
Used when: Discussing team structure
2. Cost Heatmap
Shows: Where money goes (color-coded boxes per person/team)
Used when: Budget/cost analysis
3. Timeline Simulator
Shows: Hiring roadmap over 12 months (gantt-style)
Used when: Planning recruitment
4. Benchmark Swarm
Shows: Bubble chart with 847 companies (user = blinks)
Used when: "How do we compare to others?"
5. Scenario Comparator
Shows: 3 scenarios side-by-side (cost/risk/impact)
Used when: Decision-making
6. Skills Gap Radar
Shows: Radar chart (current vs target capabilities)
Used when: Identify missing competencies
7. Live Research Animation
Shows: "Analyzing 847 companies... 67%" with progress
Used when: AI researching (building trust)
8. People Tetris
Shows: Interactive puzzle (drag people around)
Used when: Org restructuring

E. Deliverables (what user gets)
Output after each session:
1. SESSION SUMMARY
   ├─ What we discussed
   ├─ Key insights discovered
   ├─ Decisions made
   └─ Confidence scores

2. ORG DESIGN PLAN
   ├─ Proposed structure (visual)
   ├─ Role descriptions
   ├─ Reporting lines
   └─ Rationale for each choice

3. HIRING ROADMAP
   ├─ Timeline (month-by-month)
   ├─ Prioritization (hire this first, then that)
   ├─ Dependencies
   └─ Budget breakdown

4. JOB DESCRIPTIONS (per role)
   ├─ Role overview
   ├─ Responsibilities (6-8 bullets)
   ├─ Qualifications (must-have vs nice-to-have)
   ├─ Compensation range
   ├─ 30-60-90 day success plan
   ├─ Interview questions (5-8)
   └─ Red flags to avoid

5. COMPENSATION ANALYSIS
   ├─ Market benchmarks per role
   ├─ Your position (percentile)
   ├─ Recommendations
   └─ Budget impact

6. BENCHMARKS REPORT
   ├─ How you compare to 847 similar companies
   ├─ Where you're ahead/behind
   ├─ Industry standards
   └─ Trends to watch

All exportable: PDF, Markdown, Google Docs

3. TECH STACK
Frontend
Framework: Next.js 14 (App Router)
UI: React + Tailwind CSS
Animations: Framer Motion
Charts/Viz: D3.js, React Flow
Real-time: WebSocket (for live updates)
State: Zustand (simpler than Redux)
Backend
Runtime: Next.js API Routes (serverless)
Database: PostgreSQL (Supabase or Railway)
Cache: Redis (Upstash - serverless)
Vector DB: Pinecone (for semantic search)
File storage: Vercel Blob / S3
AI/ML
Primary: Claude Sonnet 4 (reasoning + generation)
Fallback: GPT-4 (if Claude down)
Embeddings: OpenAI ada-002 (search)
Fine-tuning: Later (when we have data)
Data Layer
Scraping: Playwright (LinkedIn, Glassdoor, etc)
APIs: Crunchbase, Clearbit (company data)
Storage: PostgreSQL + jsonb columns
Updates: Daily cron jobs
Infrastructure
Hosting: Vercel (frontend + API)
Database: Supabase (Postgres + auth)
Cache: Upstash Redis
Queue: Inngest (background jobs)
Analytics: PostHog (product analytics)
Monitoring: Sentry (errors)
Cost (month 1-3)
Vercel: €0 (hobby tier)
Supabase: €0 (free tier)
Upstash: €0 (free tier)
Claude API: ~€200 (500 sessions, 1 call each)
Domains: €10
──────────────────
Total: ~€210/month
Note: 5x cheaper API costs than multi-agent approach!

4. DATA STRATEGY
Tier 1: Public Data (Month 1-2)
Sources:
LinkedIn: Org charts, job titles, company info
Job Ads: Roles, salaries (when shown), requirements
Glassdoor/Levels: Self-reported comp
Crunchbase: Funding, size, growth
Annual Reports: Public companies headcount/cost
GitHub/Blogs: Eng org structures
Method:
python# Daily scraping job
for company in target_list:
    data = {
        'employees': scrape_linkedin(company),
        'jobs': scrape_job_ads(company),
        'funding': get_crunchbase(company),
        'salaries': get_glassdoor(company)
    }
    
    # AI inference
    insights = claude.analyze(data)
    # "Likely org: CEO → CTO (5 eng) + Sales (2 AE)"
    
    save_to_db(company, data, insights)

# After 1000 companies:
# → Patterns emerge
# → "78% have Sales Mgr at 2-3 AE"
Quality: 60-70% accuracy

Tier 2: Synthetic Data (Month 2-3)
Concept: AI Inference
Input: Partial data about company
Process: AI reasoning from patterns
Output: "Likely" data with confidence scores

Example:
Known: "Acme Corp, 25 people, Series A, Stockholm, B2B SaaS"
Inferred: 
- "Likely comp for Senior Dev: €85-100k (75% confidence)"
- "Likely org structure: CEO → CTO + Sales Lead (68% confidence)"
- "Likely next hire: Sales or DevOps (82% confidence)"
Quality: 50-60%, but scales fast

Tier 3: User-Contributed (Month 3+)
Flywheel:
User uses Recta
→ Shares their org data (anonymized)
→ Gets access to better benchmarks
→ Next user gets better recommendations
→ They share their data...
→ Repeat

Incentive:
"Share your data (anonymous) 
 → Get full benchmark access
 → Help improve Recta for everyone"
Quality: 70-80% after 6 months, 90%+ after 2 years

Tier 4: Premium APIs (Year 1+)
Partnerships:
LinkedIn Talent Insights: €30k/year
Mercer/WTW: Licensed surveys
Official Stats: SCB, Eurostat
For premium users (€800+/month)

Recta's Unique Data:
What consultants DON'T have:
1. Temporal Intelligence
   "Companies hired X at month Y after event Z"
   
2. Real-time Updates  
   "Stockholm salaries +8% last quarter"
   
3. Failure Data
   "43% of early CMO hires left within 18mo"
   
4. Context-Aware Benchmarks
   "Companies in YOUR exact situation did X"

5. QUALITY ASSURANCE
6 Quality Gates:
GATE 1: Input Validation
├─ Minimum context required
├─ Confidence threshold (70%+)
└─ Block generation if insufficient

GATE 2: AI Self-Critique  
├─ AI scores own output
├─ Vagueness check
├─ Regenerate if poor
└─ Ask user for more context

GATE 3: Template Validation
├─ All required sections present
├─ Minimum content per section
├─ No generic phrases
└─ Comp ranges realistic

GATE 4: Benchmark Confidence
├─ Show confidence scores always
├─ Caveat if low confidence (<60%)
├─ Suggest alternatives
└─ Transparent about limitations

GATE 5: Human Review (early)
├─ First 100 customers: manual review
├─ Flag bad outputs
├─ Improve prompts
└─ Automate learnings

GATE 6: Comparative Analysis
├─ Generate 3 versions
├─ AI ranks quality
├─ Show best, offer alternatives
└─ A/B test approaches
Minimum Standard:
BLOCK if:
├─ Confidence < 60%
├─ Missing sections
├─ Too generic
├─ Comp unrealistic
└─ Contradictions

SHIP if:
├─ Confidence ≥ 70%
├─ All sections complete
├─ Specific to situation
├─ Validated comp
└─ Passes self-critique

6. USE CASES (prioritized)
MVP (Week 1-6): 3 Core Tools
Tool 1: Smart JD Generator (Week 1-2)
Input: Role, company context
Process: AI + benchmarks
Output: Complete JD with comp, success plan, interview Qs
Time: 30 seconds
Value: Replaces €5k consultant
Tool 2: Org Gap Analyzer (Week 3-4)
Input: LinkedIn company URL or current org
Process: Scrape + AI comparison vs benchmarks
Output: "You're missing X, Y, Z roles - here's why"
Time: 2 minutes
Value: Shows hidden problems
Tool 3: Cost Intelligence Dashboard (Week 5-6)
Input: Basic payroll data
Process: AI breakdown + inefficiency detection
Output: "€30k/month can be saved here"
Time: 5 minutes
Value: Immediate ROI visible

V2 (Month 2-3): Full Org Design
Tool 4: Interactive Org Designer
Full guided conversation
→ All phases (context → problem → solution → action)
→ Canvas shows live simulations
→ Multiple scenarios
→ Complete deliverables package
Time: 20-30 minutes
Value: Replaces €50k consultant project
Tool 5: Comp Benchmarking
Upload current comp structure
→ AI analysis vs market
→ Gap identification
→ Recommendations
→ EU compliance check
Time: 10 minutes
Value: €20k compensation study

V3 (Month 4-6): Continuous Intelligence
Tool 6: Org Health Monitoring
Connect HRIS (BambooHR, Personio etc)
→ Continuous analysis
→ Proactive alerts
→ "DevOps need became urgent"
→ Weekly check-ins
Value: Living system, not one-time
Tool 7: EU Compliance Automation
Prepare for Pay Transparency Directive
→ Role leveling
→ Salary band creation
→ Gap analysis
→ Auto-reports
Value: €100k compliance project

7. USER JOURNEY
Discovery → First Value (5 min)
1. Land on site
   ↓
2. "Smart JD Generator - Try Free"
   ↓
3. Fill basic form (2 min)
   ├─ Company name
   ├─ Role
   ├─ Location
   └─ Why hiring?
   ↓
4. AI generates complete JD (30 sec)
   ├─ Shows research process (trust)
   ├─ Canvas animates
   └─ Wow moment
   ↓
5. Download PDF or copy
   ↓
6. "Want more? Try Org Gap Analyzer"
   ↓
7. Email capture: "Save your session"
Hook: Value BEFORE asking for email/payment

Free → Paid Conversion
After 3 free tools used:

"You've generated 3 job descriptions! 🎉

Upgrade to unlock:
✓ Unlimited JDs
✓ Org gap analysis
✓ Cost intelligence
✓ Full org design sessions
✓ Priority support

€200/month - first month 50% off"

[Upgrade] [Maybe Later]

Onboarding (Paid)
DAY 1: Welcome email
├─ Book onboarding call (optional)
├─ Quick-start guide
└─ First project template

DAY 3: Check-in
├─ "Tried anything yet?"
├─ Offer help
└─ Share best practices

DAY 7: Value realization
├─ "Show me what you built"
├─ Feedback request
└─ Testimonial ask (if happy)

WEEK 2: Power user
├─ Advanced features tour
├─ Integration options (HRIS)
└─ Invite team members

8. PRICING
┌─────────────────────────────────────┐
│ FREE                                │
├─────────────────────────────────────┤
│ €0 / forever                        │
│                                      │
│ ✓ 3 JD generations/month            │
│ ✓ 1 org gap analysis/month          │
│ ✓ Basic benchmarks                  │
│ ✓ Community support                 │
│                                      │
│ Perfect for: Testing, single hires  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PROFESSIONAL ⭐ (Most Popular)      │
├─────────────────────────────────────┤
│ €200 / month                        │
│                                      │
│ ✓ Unlimited JDs                     │
│ ✓ Unlimited org analysis            │
│ ✓ Cost intelligence                 │
│ ✓ Full benchmarks                   │
│ ✓ Email support                     │
│ ✓ Export all formats                │
│                                      │
│ Perfect for: Growing teams 20-100   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ BUSINESS                            │
├─────────────────────────────────────┤
│ €800 / month                        │
│                                      │
│ ✓ All Pro features                  │
│ ✓ HRIS integrations                 │
│ ✓ EU compliance automation          │
│ ✓ Advanced analytics                │
│ ✓ Priority support (Slack)          │
│ ✓ Team collaboration                │
│ ✓ White-label reports               │
│                                      │
│ Perfect for: Scale-ups 100-250      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ENTERPRISE                          │
├─────────────────────────────────────┤
│ Custom pricing                      │
│                                      │
│ ✓ All Business features             │
│ ✓ Dedicated success manager         │
│ ✓ Custom integrations               │
│ ✓ Premium data sources              │
│ ✓ On-site workshops                 │
│ ✓ SLA guarantees                    │
│ ✓ API access                        │
│                                      │
│ Perfect for: 250+ employees         │
└─────────────────────────────────────┘
Comparison:
Consultant org-design project: €50,000
Recta Professional (1 year): €2,400

= 95% cheaper, 100x faster
