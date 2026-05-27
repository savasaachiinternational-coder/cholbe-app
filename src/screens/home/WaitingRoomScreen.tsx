import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';

type Props = NativeStackScreenProps<RootStackParamList, 'WaitingRoom'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');

export function WaitingRoomScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const doctorName = route.params?.doctorName ?? 'Dr. Ahmed';
  const specialty = route.params?.specialty ?? 'Cardiologist';

  const openChat = () => {
    navigation.navigate('ConsultationChat', {doctorName, specialty});
  };

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
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Waiting Room</Text>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={openChat}>
          <Feather name="message-square" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 120},
        ]}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>
            You consultation is scheduled
          </Text>
          <Text style={styles.countdownSubtitle}>
            Call starts in{' '}
            <Text style={styles.countdownTimer}>02:45 minutes</Text>
          </Text>
        </View>

        <View style={styles.roomCard}>
          <View style={styles.doctorProfileBlock}>
            <Image source={DOCTOR_AVATAR} style={styles.doctorAvatar} />
            <Text style={styles.doctorName}>{doctorName}</Text>
            <View style={styles.specialtyRow}>
              <View style={styles.greenDot} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinCallButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ActiveVideoCall', {doctorName, specialty})
            }>
            <Text style={styles.joinCallButtonText}>Join Video Call</Text>
          </TouchableOpacity>

          <View style={styles.diagnosticGridRow}>
            <DiagnosticItem icon="camera" label="Camera" status="Ready" />
            <DiagnosticItem
              icon="mic"
              label="Mic"
              status="Ready"
              withDivider
            />
            <DiagnosticItem
              icon="wifi"
              label="Network"
              status="Good"
              withDivider
            />
          </View>

          <Text style={styles.cardInfoDisclaimer}>
            Please be ready before the call starts.{'\n'}Ensure a good internet
            connections.
          </Text>

          <View style={styles.cardNavContainer}>
            <TouchableOpacity
              style={styles.cardNavRowButton}
              activeOpacity={0.8}>
              <View style={styles.cardNavLeftMeta}>
                <Feather name="headphones" size={20} color="#0D9488" />
                <Text style={styles.cardNavButtonLabel}>
                  Switch to Audio Call
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardNavDividerLine} />

            <TouchableOpacity
              style={styles.cardNavRowButton}
              activeOpacity={0.8}
              onPress={openChat}>
              <View style={styles.cardNavLeftMeta}>
                <Feather name="message-circle" size={20} color="#0D9488" />
                <Text style={styles.cardNavButtonLabel}>Chat With Doctor</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.systemDisclaimerNoticeText}>
          This is a paid consultation. By using this services, you agree to our
          Terms.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="home"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function DiagnosticItem({
  icon,
  label,
  status,
  withDivider,
}: {
  icon: 'camera' | 'mic' | 'wifi';
  label: string;
  status: string;
  withDivider?: boolean;
}) {
  return (
    <View style={[styles.diagnosticItem, withDivider && styles.dividerLeft]}>
      <View style={styles.iconLabelRow}>
        <Feather name={icon} size={18} color="#0D9488" />
        <Text style={styles.diagnosticLabel}>{label}</Text>
      </View>
      <View style={styles.statusCheckRow}>
        <Feather name="check" size={14} color="#0D9488" />
        <Text style={styles.statusCheckText}>{status}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  countdownContainer: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
  },
  countdownTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  countdownSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  countdownTimer: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorProfileBlock: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  doctorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  joinCallButton: {
    backgroundColor: '#408E91',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  joinCallButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  diagnosticGridRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    marginBottom: 16,
  },
  diagnosticItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diagnosticLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  statusCheckText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  cardInfoDisclaimer: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
  cardNavContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardNavRowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardNavLeftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardNavButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  cardNavDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  systemDisclaimerNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 28,
    paddingHorizontal: 16,
    fontWeight: '500',
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
