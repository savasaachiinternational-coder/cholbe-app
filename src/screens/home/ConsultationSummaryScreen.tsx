import {useState} from 'react';
import {
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
import {CONSULTATION_SUMMARY} from './consultationSummaryData';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsultationSummary'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');

export function ConsultationSummaryScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const doctorName =
    route.params?.doctorName ?? CONSULTATION_SUMMARY.doctorName;
  const specialty =
    route.params?.specialty ?? CONSULTATION_SUMMARY.specialty;
  const successMessage = `You consultation with ${doctorName} is complete`;

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
      return;
    }
    if (tab === 'medication') {
      navigation.navigate('MedicineList');
      return;
    }
    if (tab === 'report') {
      navigation.navigate('ReportsList');
      return;
    }
    if (tab === 'profile') {
      navigation.navigate('MyProfile');
      return;
    }
    navigation.navigate('Home');
  };

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
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.successStatusRibbon}>
          <Feather
            name="check-circle"
            size={18}
            color="#0D9488"
            style={styles.successIconMargin}
          />
          <Text style={styles.successStatusText}>{successMessage}</Text>
        </View>

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
              <Text style={styles.metricValueComplete}>
                {CONSULTATION_SUMMARY.status}
              </Text>
            </Text>
            <Text style={styles.metricItemText}>
              Date:{' '}
              <Text style={styles.metricValueText}>
                {CONSULTATION_SUMMARY.date}
              </Text>
            </Text>
            <Text style={styles.metricItemText}>
              Duration:{' '}
              <Text style={styles.metricValueText}>
                {CONSULTATION_SUMMARY.duration}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.chatDoctorButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ConsultationChat', {doctorName, specialty})
            }>
            <Feather
              name="message-circle"
              size={18}
              color="#FFFFFF"
              style={styles.chatIconMargin}
            />
            <Text style={styles.chatDoctorButtonText}>Chat With Doctor</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackSectionHeading}>
            How was your video consultation?
          </Text>

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
            placeholder="Enter your comment..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            style={styles.feedbackTextInput}
          />

          <TouchableOpacity style={styles.submitFeedbackButton} activeOpacity={0.9}>
            <Text style={styles.submitFeedbackButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerPolicyNoticeText}>
          Terms and cancelation Policy
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="profile"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F5F6FA',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
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
  successIconMargin: {
    marginRight: 8,
  },
  successStatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    paddingBottom: 14,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  doctorInfoTextContainer: {
    marginLeft: 14,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  metricsListBlock: {
    paddingVertical: 14,
    gap: 8,
  },
  metricItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  metricValueComplete: {
    color: '#0D9488',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  metricValueText: {
    color: '#1E293B',
    fontWeight: '700',
  },
  chatDoctorButton: {
    backgroundColor: '#408E91',
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  chatIconMargin: {
    marginRight: 8,
  },
  chatDoctorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
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
  feedbackSectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  starTouch: {
    marginRight: 6,
  },
  feedbackTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    height: 110,
    marginBottom: 16,
  },
  submitFeedbackButton: {
    backgroundColor: '#408E91',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitFeedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerPolicyNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
