export const RESEARCH_CONFIG = {
  'Context': {
    enabled: false,
    minConfidence: 100,
    requiredEntities: [],
    maxQueries: 0,
    queryTemplates: []
  },
  'Problem Discovery': {
    enabled: false,
    minConfidence: 100,
    requiredEntities: [],
    maxQueries: 0,
    queryTemplates: []
  },
  'Solution Design': {
    enabled: true,
    minConfidence: 70,
    requiredEntities: ['role', 'location'],
    maxQueries: 3,
    queryTemplates: [
      '{role} salary {location} {industry} 2025',
      'typical org structure {company_size} employees {industry}',
      '{role} responsibilities {seniority} level best practices'
    ]
  },
  'Action Plan': {
    enabled: true,
    minConfidence: 80,
    requiredEntities: ['role'],
    maxQueries: 2,
    queryTemplates: [
      'hiring timeline {role} {location} realistic',
      'interview process {role} best practices 2025'
    ]
  }
} as const;

export const ENTITY_PATTERNS = {
  role: [
    /\b(?:Chief\s+)?(?:CTO|CEO|CFO|COO|CMO|CPO)\b/gi,
    /\bHead\s+of\s+\w+/gi,
    /\b(?:VP|Vice President|Director|Manager|Lead)\s+(?:of\s+)?\w+/gi,
    /\b(?:Senior|Junior|Staff|Principal)\s+(?:Software\s+)?(?:Engineer|Developer|Designer|Analyst|Architect)\b/gi,
    /\b(?:DevOps|Backend|Frontend|Full[- ]?stack|Data)\s+(?:Engineer|Developer)\b/gi,
    /\bMarknadschef\b/gi,
    /\bSäljchef\b/gi,
    /\bTeknisk\s+chef\b/gi
  ],
  location: [
    /\b(?:Stockholm|Göteborg|Malmö|Uppsala|Västerås|Örebro|Linköping|Helsingborg|Jönköping|Norrköping)\b/gi,
    /\b(?:Copenhagen|Oslo|Helsinki|Århus|Bergen|Tampere|Espoo)\b/gi,
    /\b(?:London|Berlin|Amsterdam|Paris|Madrid|Barcelona)\b/gi,
    /\b(?:New York|San Francisco|Boston|Seattle|Austin|Chicago)\b/gi,
    /\bin\s+([A-Z][a-zåäö]+(?:\s+[A-Z][a-zåäö]+)?)\b/g
  ],
  industry: [
    /\bSaaS\b/gi,
    /\b(?:fintech|financial technology)\b/gi,
    /\be-commerce\b/gi,
    /\b(?:AI|ML|machine learning|artificial intelligence)\b/gi,
    /\bhealthtech\b/gi,
    /\b(?:B2B|B2C)\b/gi,
    /\bstartup\b/gi,
    /\bscale[- ]?up\b/gi
  ],
  company_size: [
    /\b(\d+)\s+(?:personer|people|employees|team members|anställda)\b/gi,
    /\bteam\s+(?:of|på)\s+(\d+)\b/gi,
    /\b(\d+)[- ]persons?\s+(?:team|företag|company)\b/gi
  ],
  seniority: [
    /\b(senior|junior|mid[- ]?level|staff|principal|lead)\b/gi
  ]
} as const;

export type PhaseId = keyof typeof RESEARCH_CONFIG;
export type EntityType = keyof typeof ENTITY_PATTERNS;

