import type {NavigationProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';
import type {DoctorAppointment} from '../../api/doctorPortal';

type Nav = NavigationProp<RootStackParamList>;

export function openDoctorConsultation(navigation: Nav, appt: DoctorAppointment) {
  if (appt.consultationType === 'CHAT') {
    navigation.navigate('ConsultationChat', {
      appointmentId: appt.id,
      doctorName: appt.patient.fullName,
      specialty: 'Patient chat',
      viewerRole: 'DOCTOR',
    });
    return;
  }
  navigation.navigate('WaitingRoom', {
    appointmentId: appt.id,
    doctorName: appt.patient.fullName,
    specialty: 'Video consultation',
    viewerRole: 'DOCTOR',
  });
}
