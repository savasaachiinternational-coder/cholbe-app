export type AppointmentDetail = {
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeRange: string;
  consultationType: string;
  fee: string;
  countdownLabel: string;
  reminderMinutes: number;
};

export const UPCOMING_APPOINTMENT: AppointmentDetail = {
  doctorName: 'Dr. Ahmed',
  specialty: 'Cardiologist',
  dateLabel: 'Today, Apr 25',
  timeRange: '10:30 AM - 10:45 AM',
  consultationType: 'Video consolation',
  fee: 'BDT 800',
  countdownLabel: 'Starts in 12 min',
  reminderMinutes: 12,
};

export const PAST_APPOINTMENT: AppointmentDetail = {
  doctorName: 'Dr. Ahmed',
  specialty: 'Cardiologist',
  dateLabel: 'Apr 25 2024',
  timeRange: '10:30 AM - 10:45 AM',
  consultationType: 'Video consolation',
  fee: 'BDT 800',
  countdownLabel: 'Completed',
  reminderMinutes: 0,
};
