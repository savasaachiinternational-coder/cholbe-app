import type {MedicationSchedule} from '../medications';

export type ReminderSection = {
  id: string;
  label: string;
  items: ReminderItem[];
};

export type ReminderItem = {
  scheduleId: string;
  switchKey: string;
  medicine: string;
  time: string;
  frequency: string;
  isActive: boolean;
};

function periodForTime(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 'other';
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
}

const PERIOD_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
  other: 'Other',
};

export function schedulesToReminderSections(
  schedules: MedicationSchedule[],
): ReminderSection[] {
  const buckets = new Map<string, ReminderItem[]>();

  schedules.forEach(schedule => {
    const times = schedule.times.length ? schedule.times : ['08:00 AM'];
    const frequency = [
      schedule.mealTiming,
      schedule.instruction,
      'Every day',
    ]
      .filter(Boolean)
      .join(', ');

    times.forEach((time, index) => {
      const period = periodForTime(time);
      const items = buckets.get(period) ?? [];
      items.push({
        scheduleId: schedule.id,
        switchKey: `${schedule.id}-${index}`,
        medicine: schedule.dose
          ? `${schedule.medicineName} ${schedule.dose}`
          : schedule.medicineName,
        time,
        frequency: frequency || 'Scheduled daily',
        isActive: schedule.isActive,
      });
      buckets.set(period, items);
    });
  });

  const order = ['morning', 'afternoon', 'evening', 'night', 'other'];
  return order
    .filter(id => buckets.has(id))
    .map(id => ({
      id,
      label: PERIOD_LABELS[id],
      items: buckets.get(id) ?? [],
    }));
}

export function allRemindersEnabled(schedules: MedicationSchedule[]): boolean {
  return schedules.length > 0 && schedules.every(s => s.isActive);
}
