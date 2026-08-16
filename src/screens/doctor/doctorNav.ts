export type DoctorTabKey = 'home' | 'appointments' | 'patients' | 'profile';

export const DOCTOR_TABS: {
  key: DoctorTabKey;
  label: string;
  icon: 'home' | 'calendar' | 'users' | 'user';
}[] = [
  {key: 'home', label: 'Home', icon: 'home'},
  {key: 'appointments', label: 'Appointments', icon: 'calendar'},
  {key: 'patients', label: 'Patients', icon: 'users'},
  {key: 'profile', label: 'Profile', icon: 'user'},
];

export const APPOINTMENT_STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
export type AppointmentStatusFilter = (typeof APPOINTMENT_STATUS_FILTERS)[number];

export function formatAppointmentDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
}

export function formatAppointmentStatus(status: string) {
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed') return '#2E7D32';
  if (s === 'cancelled' || s === 'no_show') return '#C62828';
  if (s === 'in_progress') return '#1565C0';
  if (s === 'confirmed') return '#4E929D';
  return '#F57C00';
}
