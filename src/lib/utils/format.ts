import { differenceInCalendarDays, format, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatXP(xp: number): string {
  return xp.toLocaleString('en-US');
}

export function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow · ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`;
  const days = differenceInCalendarDays(d, new Date());
  if (days > -7 && days < 0) return `${Math.abs(days)}d overdue`;
  if (days > 0 && days < 7) return format(d, "EEE · h:mm a");
  return format(d, 'MMM d · h:mm a');
}

export function formatRelativeDue(iso: string): string {
  const d = new Date(iso).getTime();
  const diffMs = d - Date.now();
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 60) return mins >= 0 ? `in ${mins}m` : `${Math.abs(mins)}m late`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return hrs >= 0 ? `in ${hrs}h` : `${Math.abs(hrs)}h late`;
  const days = Math.round(hrs / 24);
  return days >= 0 ? `in ${days}d` : `${Math.abs(days)}d late`;
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

// Deterministic warm-palette color from a seed string (for avatar fallbacks)
const AVATAR_PALETTE = ['#D4A574', '#B8895D', '#9A6E47', '#CDA178', '#A37856', '#7D5638', '#C99571'];
export function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx]!;
}
