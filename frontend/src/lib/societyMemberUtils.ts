export const TOTAL_PLATFORM_MEMBERS = 2498;

/**
 * Allocates exactly 2498 members among the provided list of societies.
 * Ensures the sum of `membersCount` across all societies in the array is ALWAYS 2498.
 */
export function allocateSocietyMemberCounts<T extends Record<string, any>>(societies: T[]): (T & { membersCount: number })[] {
  if (!societies || !Array.isArray(societies) || societies.length === 0) {
    return [];
  }

  const n = societies.length;
  if (n === 1) {
    return [{ ...societies[0], membersCount: TOTAL_PLATFORM_MEMBERS }];
  }

  // Pre-calculated deterministic proportions for clean distribution
  const weights = societies.map((s, idx) => {
    const key = String(s._id || s.id || s.name || idx);
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33 + key.charCodeAt(i)) & 0xffff;
    }
    return 200 + (hash % 250) + ((n - idx) * 15);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let allocatedSum = 0;

  return societies.map((s, idx) => {
    let count: number;
    if (idx === n - 1) {
      count = TOTAL_PLATFORM_MEMBERS - allocatedSum;
    } else {
      count = Math.round((weights[idx] / totalWeight) * TOTAL_PLATFORM_MEMBERS);
      allocatedSum += count;
    }

    return {
      ...s,
      membersCount: count,
    };
  });
}

/**
 * Returns a deterministic member count for a single society when the full array is not available.
 */
export function getSingleSocietyMemberCount(id?: string, allSocieties?: any[]): number {
  if (allSocieties && Array.isArray(allSocieties) && allSocieties.length > 0) {
    const allocated = allocateSocietyMemberCounts(allSocieties);
    const found = allocated.find((s) => String(s._id || s.id) === String(id));
    if (found) return found.membersCount;
  }

  if (!id) return 415;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  }
  return 350 + (hash % 150);
}
