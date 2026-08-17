import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {consultationsApi} from '../../api/consultations';
import {appointmentsApi} from '../../api/appointments';
import {toAppointmentDetail} from '../../api/utils/appointmentHelpers';
import {ApiError} from '../../api/client';
import {getStoredUser} from '../../api/tokenStorage';
import { WaveTitleBand } from '../../components/WaveTitleBand';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsultationSummary'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');

export function ConsultationSummaryScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDoctorViewer, setIsDoctorViewer] = useState(false);

  const appointmentId = route.params?.appointmentId;
  const [doctorName, setDoctorName] = useState(route.params?.doctorName ?? 'Doctor');
  const [specialty, setSpecialty] = useState(route.params?.specialty ?? 'Specialist');
  const [dateLabel, setDateLabel] = useState('—');
  const [durationLabel, setDurationLabel] = useState('—');
  const [statusLabel, setStatusLabel] = useState('Completed');
  const [consultationType, setConsultationType] = useState('Video consultation');

  const successMessage = `Your consultation with ${doctorName} is complete`;

  useEffect(() => {
    void getStoredUser().then(user => {
      if (user?.role === 'DOCTOR') setIsDoctorViewer(true);
    });
  }, []);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [appt, feedback] = await Promise.all([
          appointmentsApi.getById(appointmentId),
          consultationsApi.getFeedback(appointmentId).catch(() => null),
        ]);
        if (!mounted) return;
        const detail = toAppointmentDetail(appt);
        setDoctorName(detail.doctorName);
        setSpecialty(detail.specialty);
        setDateLabel(`${detail.dateLabel} · ${detail.timeRange}`);
        setDurationLabel(`${appt.durationMin} minutes`);
        setStatusLabel(
          appt.status.toLowerCase() === 'completed' ? 'Completed' : appt.status,
        );
        setConsultationType(detail.consultationType);
        if (feedback) {
          setSubmitted(true);
          setRating(feedback.rating);
          setComment(feedback.comment ?? '');
        }
      } catch (err) {
        Alert.alert(
          'Summary',
          err instanceof ApiError ? err.message : 'Could not load consultation summary',
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') { navigation.navigate('Home'); return; }
    if (tab === 'medication') { navigation.navigate('MedicineList'); return; }
    if (tab === 'report') { navigation.navigate('ReportsList'); return; }
    if (tab === 'profile') { navigation.navigate('MyProfile'); return; }
    navigation.navigate('Home');
  };

  const submitFeedback = async () => {
    if (!appointmentId) {
      Alert.alert('Review', 'No appointment found to review.');
      return;
    }
    setSubmitting(true);
    try {
      await consultationsApi.submitFeedback(appointmentId, {rating, comment: comment.trim() || undefined});
      setSubmitted(true);
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 110}]}>
        {/* <View style={styles.successStatusRibbon}>
          <Feather name="check-circle" size={18} color="#0D9488" style={styles.successIconMargin} />
          <Text style={styles.successStatusText}>{successMessage}</Text>
        </View> */}

        <WaveTitleBand title={successMessage} icon = 'check-circle' style={{fontSize: 14, fontWeight: '400', color: '#616161', flex: 1}}/>

        <View style={styles.summaryCard}>
          <View style={styles.doctorMetaRow}>
            <Image source={DOCTOR_AVATAR} style={styles.doctorAvatar} />
            <View style={styles.doctorInfoTextContainer}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.doctorSpecialty}>{specialty}</Text>
            </View>
          </View>

          <View style={styles.metricsListBlock}>
            <Text style={styles.metricItemText}>
              Status:{' '}
              <Text style={styles.metricValueComplete}>{statusLabel}</Text>
            </Text>
            {/* <Text style={styles.metricItemText}>
              Type:{' '}
              <Text style={styles.metricValueText}>{consultationType}</Text>
            </Text> */}
            <Text style={styles.metricItemText}>
              Date:{' '}
              <Text style={styles.metricValueText}>{dateLabel}</Text>
            </Text>
            <Text style={styles.metricItemText}>
              Duration:{' '}
              <Text style={styles.metricValueText}>{durationLabel}</Text>
            </Text>
          </View>

          {appointmentId ? (
            <TouchableOpacity
              style={styles.chatDoctorButton}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('ConsultationChat', {
                  doctorName,
                  specialty,
                  appointmentId,
                  viewerRole: isDoctorViewer ? 'DOCTOR' : 'CUSTOMER',
                })
              }>
              <Feather name="message-circle" size={18} color="#FFFFFF" style={styles.chatIconMargin} />
              <Text style={styles.chatDoctorButtonText}>Chat With Doctor</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {!isDoctorViewer && (
          submitted ? (
            <View style={styles.feedbackCard}>
              <View style={styles.submittedRow}>
                <Feather name="check-circle" size={20} color="#0D9488" />
                <Text style={styles.submittedText}>Review submitted! Thank you.</Text>
              </View>
              {comment ? (
                <Text style={styles.submittedComment}>"{comment}"</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackSectionHeading}>How was your consultation?</Text>

              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map(starIndex => (
                  <TouchableOpacity
                    key={starIndex}
                    activeOpacity={0.8}
                    onPress={() => setRating(starIndex)}
                    style={styles.starTouch}>
                    <FontAwesome
                      name="star"
                      size={26}
                      color={starIndex <= rating ? '#FBBF24' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Share your experience (optional)..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
                style={styles.feedbackTextInput}
              />

              <TouchableOpacity
                style={[styles.submitFeedbackButton, submitting && {opacity: 0.6}]}
                activeOpacity={0.9}
                onPress={submitFeedback}
                disabled={submitting || !appointmentId}>
                <Text style={styles.submitFeedbackButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>

              {!appointmentId ? (
                <Text style={styles.noApptNote}>Open a completed appointment from My Appointment to leave a review.</Text>
              ) : null}
            </View>
          )
        )}

        <Text style={styles.footerPolicyNoticeText}>Terms and Cancellation Policy</Text>
      </ScrollView>
       <TouchableOpacity
              style={[styles.floatingScanButton, { bottom: insets.bottom + 100 }]}
              activeOpacity={0.85}
            >
              <Image source={require('../../assets/syaiicon.png')} />
            </TouchableOpacity>

      {!isDoctorViewer ? (
        <View style={styles.bottomNavWrap}>
          <HomeBottomNav
            activeTab="profile"
            bottomInset={insets.bottom}
            onTabPress={handleTabPress}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F3FC'},
  centered: {justifyContent: 'center', alignItems: 'center'},
  header: {
    flexDirection: 'row',
    justifyContent:"center",
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap:10,
    backgroundColor: '#F5F4FD',
  },
  backButton: {padding: 4, width: 32},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#424242', flex: 1,},
  headerSpacer: {width: 32},
  scrollContent: {paddingHorizontal: 16},
  successStatusRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  successIconMargin: {marginRight: 8},
  successStatusText: {fontSize: 13, fontWeight: '500', color: '#334155', flex: 1},
  summaryCard: {
    marginTop:24,
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 16,
  },
  doctorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  doctorAvatar: {width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0'},
  doctorInfoTextContainer: {marginLeft: 14},
  doctorName: {fontSize: 18, fontWeight: '600', color: '#212121'},
  doctorSpecialty: {fontSize: 14, color: '#616161', fontWeight: '400', marginTop: 2},
  metricsListBlock: {paddingVertical: 14, gap: 8},
  metricItemText: {fontSize: 13, fontWeight: '500', color: '#64748B'},
  metricValueComplete: {color: '#0D9488', fontWeight: '600'},
  metricValueText: {color: '#1E293B', fontWeight: '700'},
  chatDoctorButton: {
    backgroundColor: '#408E91',
    borderRadius: 40,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  chatIconMargin: {marginRight: 8},
  chatDoctorButtonText: {color: '#FFFFFF', fontSize: 12, fontWeight: '400'},
  feedbackCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  submittedRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8},
  submittedText: {fontSize: 14, color: '#0D9488', fontWeight: '600'},
  submittedComment: {fontSize: 13, color: '#64748B', fontStyle: 'italic', marginTop: 4},
  feedbackSectionHeading: {fontSize: 14, fontWeight: '600', color: '#616161', marginTop: 4},
  ratingStarsRow: {flexDirection: 'row', marginTop: 12, marginBottom: 16},
  starTouch: {marginRight: 6},
  feedbackTextInput: {
    backgroundColor: '#F5F4FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    height: 100,
    marginBottom: 12,
  },
  submitFeedbackButton: {
    backgroundColor: '#408E91',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal:14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitFeedbackButtonText: {color: '#FFFFFF', fontSize: 14, fontWeight: '600'},
  noApptNote: {fontSize: 11, color: '#EF4444', textAlign: 'center', marginTop: 8},
  footerPolicyNoticeText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
   floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bottomNavWrap: {position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10},
});
