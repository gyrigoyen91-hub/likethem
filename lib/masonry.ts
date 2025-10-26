// lib/masonry.ts
export function isTallByIndex(i: number) {
  // Match Home's pattern EXACTLY. 
  // Pattern: tall for indices 1 and 4 in each group of 6
  const pos = i % 6;
  return pos === 1 || pos === 4;
}
