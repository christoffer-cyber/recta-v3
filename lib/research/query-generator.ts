import { ExtractedEntities } from './entity-extractor';

export function generateQueries(
  templates: readonly string[],
  entities: ExtractedEntities
): string[] {
  const queries = templates
    .map(template => interpolateTemplate(template, entities))
    .filter(query => query !== null) as string[];
  
  console.log('[Query Generator] Generated', queries.length, 'queries:', queries);
  return queries;
}

function interpolateTemplate(
  template: string,
  entities: ExtractedEntities
): string | null {
  let result = template;
  const placeholders = template.match(/\{(\w+)\}/g);
  
  if (!placeholders) return template;

  // Check if all required placeholders have values
  for (const placeholder of placeholders) {
    const key = placeholder.slice(1, -1); // Remove { }
    const value = entities[key];
    
    if (!value) {
      // Missing required entity, skip this query
      console.log('[Query Generator] Skipping template (missing {' + key + '}):', template);
      return null;
    }
    
    result = result.replace(placeholder, value);
  }

  return result;
}

