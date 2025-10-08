import { ENTITY_PATTERNS, type EntityType } from './config';

export interface ExtractedEntities {
  role?: string;
  location?: string;
  industry?: string;
  company_size?: string;
  seniority?: string;
  [key: string]: string | undefined;
}

export function extractEntities(insights: string[]): ExtractedEntities {
  const allText = insights.join(' ');
  const entities: ExtractedEntities = {};

  // Extract each entity type using patterns
  (Object.keys(ENTITY_PATTERNS) as EntityType[]).forEach(entityType => {
    const patterns = ENTITY_PATTERNS[entityType];
    
    for (const pattern of patterns) {
      const matches = allText.match(pattern);
      if (matches && matches.length > 0) {
        // Take first match, clean it up
        let value = matches[0].trim();
        
        // For company_size, extract just the number
        if (entityType === 'company_size') {
          const num = value.match(/\d+/);
          value = num ? num[0] : value;
        }
        
        entities[entityType] = value;
        break; // Found one, move to next entity type
      }
    }
  });

  console.log('[Entity Extractor] Found:', entities);
  return entities;
}

export function hasRequiredEntities(
  entities: ExtractedEntities,
  required: readonly string[]
): boolean {
  const hasAll = required.every(key => entities[key] !== undefined);
  if (!hasAll) {
    console.log('[Entity Extractor] Missing required:', required.filter(k => !entities[k]));
  }
  return hasAll;
}

