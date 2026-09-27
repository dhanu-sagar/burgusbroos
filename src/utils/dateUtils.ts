export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateString: string): string {
  const today = getTodayDateString();
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const todayParts = today.split('-').map(Number);
  const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  
  const diffTime = todayDate.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';

  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  return targetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getOffsetDateString(baseDateString: string, offsetDays: number): string {
  const [year, month, day] = baseDateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export interface WeekRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  days: string[]; // 7 days YYYY-MM-DD
  label: string;
}

export function getWeekRange(dateString: string, weekStart: 'monday' | 'sunday' = 'monday'): WeekRange {
  const [year, month, day] = dateString.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  const currentDayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday, ...

  let diffToStart = 0;
  if (weekStart === 'monday') {
    // If Sunday (0), it's 6 days past Monday
    diffToStart = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  } else {
    // Week starts on Sunday
    diffToStart = currentDayOfWeek;
  }

  const startDate = new Date(current);
  startDate.setDate(current.getDate() - diffToStart);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${dt}`);
  }

  const startStr = days[0];
  const endStr = days[6];

  const startLabel = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const [ey, em, ed] = endStr.split('-').map(Number);
  const endDate = new Date(ey, em - 1, ed);
  const endLabel = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    start: startStr,
    end: endStr,
    days,
    label: `${startLabel} – ${endLabel}`,
  };
}

export function formatDurationHuman(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatTimerDigital(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
