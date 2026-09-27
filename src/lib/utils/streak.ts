import type { Profile } from '../types';

type StreakInputs = Pick<Profile, 'currentStreak' | 'lastCompletionDate'>;

/** UTC today as YYYY-MM-DD. Matches the server-side day used by the trigger. */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Whole days between two YYYY-MM-DD strings (a - b). */
function daysBetween(a: string, b: string): number {
  const day = 24 * 3600 * 1000;
  return Math.floor((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / day);
}

/**
 * Streak to display. The stored `currentStreak` only changes when the user
 * completes a task, so it stays at its last value if they miss days. Decay
 * to zero client-side when the last completion was more than a day ago.
 */
export function effectiveStreak({ currentStreak, lastCompletionDate }: StreakInputs): number {
  if (!lastCompletionDate) return 0;
  const gap = daysBetween(utcToday(), lastCompletionDate);
  if (gap > 1 || gap < 0) return 0;
  return currentStreak;
}

/** True when today has no completion yet but yesterday did — a completion is needed to keep the streak. */
export function streakAtRisk({ currentStreak, lastCompletionDate }: StreakInputs): boolean {
  if (!lastCompletionDate || currentStreak === 0) return false;
  return daysBetween(utcToday(), lastCompletionDate) === 1;
}
