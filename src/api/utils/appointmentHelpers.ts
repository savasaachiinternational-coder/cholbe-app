import type {Appointment} from '../appointments';

export type AppointmentDetail = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeRange: string;
  consultationType: string;
  fee: string;
  countdownLabel: string;
  reminderMinutes: number;
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
  if (Number.isNaN(amount)) return `BDT ${fee}`;
  return `BDT ${amount}`;
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

export function toAppointmentDetail(appt: Appointment): AppointmentDetail {
  const scheduled = new Date(appt.scheduledDate);
  const end = new Date(scheduled);
  end.setMinutes(end.getMinutes() + appt.durationMin);
  const countdown =
    appt.status === 'completed' || appt.status === 'cancelled'
      ? {label: appt.status === 'completed' ? 'Completed' : 'Cancelled', minutes: 0}
      : countdownFrom(scheduled);

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
    consultationType: 'Video consultation',
    fee: formatFee(appt.fee),
    countdownLabel: countdown.label,
    reminderMinutes: countdown.minutes,
  };
}

export function isUpcomingAppointment(appt: Appointment): boolean {
  if (['completed', 'cancelled', 'no_show'].includes(appt.status)) {
    return false;
  }
  return new Date(appt.scheduledDate).getTime() >= Date.now() - 60 * 60 * 1000;
}
