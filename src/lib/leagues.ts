import type { League } from './types';

export const LEAGUES: readonly League[] = [
  { key: 'espresso', label: 'Espresso League', minXP: 0 },
  { key: 'latte', label: 'Latte League', minXP: 500 },
  { key: 'cappuccino', label: 'Cappuccino League', minXP: 2500 },
  { key: 'mocha', label: 'Mocha League', minXP: 8000 },
] as const;

export function leagueFor(xp: number): League {
  let current = LEAGUES[0]!;
  for (const l of LEAGUES) {
    if (xp >= l.minXP) current = l;
  }
  return current;
}

export function nextLeague(xp: number): League | null {
  const sorted = [...LEAGUES].sort((a, b) => a.minXP - b.minXP);
  return sorted.find((l) => l.minXP > xp) ?? null;
}

export function leagueProgress(xp: number): { current: League; next: League | null; pct: number } {
  const current = leagueFor(xp);
  const next = nextLeague(xp);
  if (!next) return { current, next: null, pct: 1 };
  const span = next.minXP - current.minXP;
  const into = xp - current.minXP;
  return { current, next, pct: Math.min(1, Math.max(0, into / span)) };
}
