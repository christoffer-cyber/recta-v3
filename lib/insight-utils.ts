// Normalize text for comparison (remove punctuation, extra spaces, case)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .trim();
}

// Extract category from insight (e.g., "Företag: 10 personer" → "företag")
function extractCategory(insight: string): string | null {
  const match = insight.match(/^([^:]+):/);
  return match ? normalizeText(match[1]) : null;
}

// Extract value from insight (everything after colon)
function extractValue(insight: string): string {
  const parts = insight.split(':');
  if (parts.length < 2) return normalizeText(insight);
  return normalizeText(parts.slice(1).join(':'));
}

// Check if two insights are in the same category
function isSameCategory(insight1: string, insight2: string): boolean {
  const cat1 = extractCategory(insight1);
  const cat2 = extractCategory(insight2);
  return cat1 !== null && cat2 !== null && cat1 === cat2;
}

// Calculate similarity score between two texts (0-1)
function similarityScore(text1: string, text2: string): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  // Exact match
  if (normalized1 === normalized2) return 1.0;
  
  // One contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
    const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2;
    return shorter.length / longer.length;
  }
  
  // Jaccard similarity (word overlap)
  const words1 = new Set(normalized1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(normalized2.split(' ').filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// Check if insight is semantically duplicate
function isDuplicate(newInsight: string, existingInsight: string): boolean {
  // Check full insight similarity
  const fullSimilarity = similarityScore(newInsight, existingInsight);
  if (fullSimilarity > 0.85) {
    console.log(`[Dedup] High similarity (${fullSimilarity.toFixed(2)}): "${newInsight}" vs "${existingInsight}"`);
    return true;
  }
  
  // If same category, check value similarity
  if (isSameCategory(newInsight, existingInsight)) {
    const value1 = extractValue(newInsight);
    const value2 = extractValue(existingInsight);
    const valueSimilarity = similarityScore(value1, value2);
    
    if (valueSimilarity > 0.80) {
      console.log(`[Dedup] Same category, similar value (${valueSimilarity.toFixed(2)}): "${newInsight}" vs "${existingInsight}"`);
      return true;
    }
  }
  
  return false;
}

// Merge two insights intelligently
function mergeInsights(existing: string, newInsight: string): string {
  const category = extractCategory(existing) || extractCategory(newInsight);
  
  if (!category) {
    // No category, just prefer longer/more detailed
    return newInsight.length > existing.length ? newInsight : existing;
  }
  
  // Extract values
  const existingValue = existing.split(':').slice(1).join(':').trim();
  const newValue = newInsight.split(':').slice(1).join(':').trim();
  
  // If new contains more info, prefer it
  if (newValue.length > existingValue.length * 1.3) {
    console.log(`[Dedup] New insight more comprehensive, replacing: "${existing}" → "${newInsight}"`);
    return newInsight;
  }
  
  // If existing already contains new info, keep existing
  if (normalizeText(existingValue).includes(normalizeText(newValue))) {
    console.log(`[Dedup] Existing already contains new info, keeping: "${existing}"`);
    return existing;
  }
  
  // If new contains info not in existing, combine intelligently
  const normalized1 = normalizeText(existingValue);
  const normalized2 = normalizeText(newValue);
  
  if (!normalized1.includes(normalized2) && !normalized2.includes(normalized1)) {
    const combined = `${category.charAt(0).toUpperCase() + category.slice(1)}: ${existingValue}, ${newValue}`;
    console.log(`[Dedup] Combining: "${existing}" + "${newInsight}" → "${combined}"`);
    return combined;
  }
  
  // Default: prefer more detailed
  return newInsight.length > existing.length ? newInsight : existing;
}

// Main deduplication function
export function deduplicateInsights(
  existingInsights: string[], 
  newInsights: string[]
): string[] {
  const result = [...existingInsights];
  
  for (const newInsight of newInsights) {
    let shouldAdd = true;
    let mergedIndex = -1;
    
    // Check against all existing insights
    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      
      // Check if duplicate
      if (isDuplicate(newInsight, existing)) {
        console.log(`[Dedup] ❌ Skipping duplicate: "${newInsight}"`);
        shouldAdd = false;
        break;
      }
      
      // Check if should merge (same category, complementary info)
      if (isSameCategory(newInsight, existing)) {
        const value1 = extractValue(newInsight);
        const value2 = extractValue(existing);
        const similarity = similarityScore(value1, value2);
        
        // If similar but not identical, merge
        if (similarity > 0.5 && similarity < 0.85) {
          mergedIndex = i;
          break;
        }
      }
    }
    
    if (mergedIndex !== -1) {
      // Merge with existing
      result[mergedIndex] = mergeInsights(result[mergedIndex], newInsight);
    } else if (shouldAdd) {
      // Add as new insight
      console.log(`[Dedup] ✅ Adding new: "${newInsight}"`);
      result.push(newInsight);
    }
  }
  
  return result;
}
