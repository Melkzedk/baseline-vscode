// src/featureScanner.ts
import baselineData from './baseline.json';

export interface Feature {
  id: string;
  type: string;       // 'api' | 'css' | ...
  name: string;       // name or token to match
  safe: boolean;
  note?: string;
  browsers: { [k: string]: string };
  mdn?: string;
}

export function loadBaseline(): Feature[] {
  return (baselineData as any).features as Feature[];
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find textual matches for baseline features inside `text`.
 * Returns tuples: { feature, index, length, matchText }.
 *
 * NOTE: This is intentionally simple (regex-based). Replace with AST parsing
 * if you need high accuracy.
 */
export function findFeatureMatches(text: string, baseline: Feature[]) {
  const matches: Array<{ feature: Feature; index: number; length: number; matchText: string }> = [];

  for (const feature of baseline) {
    let pattern: RegExp;
    const escaped = escapeRegExp(feature.name);

    if (feature.type === 'api') {
      // If full dotted name provided, match exact dotted text.
      // If name is simple (like `fetch`) use word boundaries.
      if (feature.name.includes('.')) {
        pattern = new RegExp(escaped, 'g');
      } else {
        pattern = new RegExp(`\\b${escaped}\\b`, 'g');
      }
    } else if (feature.type === 'css') {
      // For CSS properties we attempt to match "property:" occurrences
      // (property names followed by optional whitespace and a colon).
      pattern = new RegExp(`\\b${escaped}\\b(?=\\s*:)`, 'g');
    } else {
      pattern = new RegExp(`\\b${escaped}\\b`, 'g');
    }

    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      matches.push({
        feature,
        index: m.index,
        length: m[0].length,
        matchText: m[0]
      });
    }
  }

  // Sort by position (helpful for predictable diagnostics)
  matches.sort((a, b) => a.index - b.index);
  return matches;
}
