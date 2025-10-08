export { executeResearch } from './research-service';
export { shouldTriggerResearch } from './trigger';
export { formatResearchForPrompt } from './formatter';
export { extractEntities, hasRequiredEntities } from './entity-extractor';
export { generateQueries } from './query-generator';
export { RESEARCH_CONFIG, ENTITY_PATTERNS } from './config';

export type { ResearchResult } from './research-service';
export type { ExtractedEntities } from './entity-extractor';
export type { ConversationState } from './trigger';

