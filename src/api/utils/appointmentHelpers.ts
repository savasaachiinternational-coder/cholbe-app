import type {Appointment} from '../appointments';
import {formatBdt} from '../../utils/pharmacyHelpers';

export type AppointmentDetail = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeRange: string;
  consultationType: string;
  consultationTypeRaw: 'VIDEO' | 'CHAT' | 'AUDIO';
  fee: string;
  countdownLabel: string;
  reminderMinutes: number;
  status: string;
};

function formatDateLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return `Today, ${date.toLocaleDateString('en-GB', {month: 'short', day: 'numeric'})}`;
  }
  if (sameDay(date, tomorrow)) {
    return `Tomorrow, ${date.toLocaleDateString('en-GB', {month: 'short', day: 'numeric'})}`;
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFee(fee: string | number): string {
  const amount = typeof fee === 'string' ? Number(fee) : fee;
  return Number.isNaN(amount) ? String(fee) : formatBdt(amount);
}

function parseTimeSlotOnDate(dateOnly: Date, timeSlot: string): Date {
  const year = dateOnly.getFullYear();
  const month = dateOnly.getMonth();
  const day = dateOnly.getDate();
  const match = timeSlot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return dateOnly;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return new Date(year, month, day, hours, minutes, 0, 0);
}

export function getAppointmentDateTime(appt: {
  scheduledDate: string;
  timeSlot: string;
}): Date {
  const dateOnly = new Date(appt.scheduledDate);
  return parseTimeSlotOnDate(dateOnly, appt.timeSlot);
}

function countdownFrom(date: Date): {label: string; minutes: number} {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) {
    return {label: 'Ready to join', minutes: 0};
  }
  const minutes = Math.ceil(diffMs / 60000);
  if (minutes < 60) {
    return {label: `Starts in ${minutes} min`, minutes};
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return {label: `Starts in ${hours}h ${rem}m`, minutes};
}

function consultationLabel(type?: string) {
  if (type === 'CHAT') return 'Chat consultation';
  if (type === 'AUDIO') return 'Audio consultation';
  return 'Video consultation';
}

export function toAppointmentDetail(appt: Appointment): AppointmentDetail {
  const scheduled = getAppointmentDateTime(appt);
  const end = new Date(scheduled);
  end.setMinutes(end.getMinutes() + appt.durationMin);
  const status = appt.status.toLowerCase();
  const countdown =
    status === 'completed' || status === 'cancelled'
      ? {label: status === 'completed' ? 'Completed' : 'Cancelled', minutes: 0}
      : countdownFrom(scheduled);
  const typeRaw = (appt.consultationType ?? 'VIDEO') as 'VIDEO' | 'CHAT' | 'AUDIO';

  return {
    id: appt.id,
    doctorId: appt.doctor.id,
    doctorName: appt.doctor.user.fullName,
    specialty: appt.doctor.specialty,
    dateLabel: formatDateLabel(scheduled),
    timeRange: `${appt.timeSlot} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`,
    consultationType: consultationLabel(typeRaw),
    consultationTypeRaw: typeRaw,
    fee: formatFee(appt.fee),
    countdownLabel: countdown.label,
    reminderMinutes: countdown.minutes,
    status: appt.status,
  };
}

export function isUpcomingAppointment(appt: Appointment): boolean {
  const status = appt.status.toLowerCase();
  if (['completed', 'cancelled', 'no_show'].includes(status)) {
    return false;
  }
  const scheduled = getAppointmentDateTime(appt);
  return scheduled.getTime() >= Date.now() - 60 * 60 * 1000;
}

export function isCompletedStatus(status: string) {
  return ['completed', 'COMPLETED'].includes(status);
}
