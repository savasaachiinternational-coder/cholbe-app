import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RtcSurfaceView} from 'react-native-agora';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {useAgoraRtc} from '../../hooks/useAgoraRtc';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {appointmentsApi} from '../../api/appointments';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_HEIGHT * 0.58;

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveVideoCall'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');

export function ActiveVideoCallScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const appointmentId = route.params.appointmentId;
  const doctorName = route.params?.doctorName ?? 'Dr. Ahmed';
  const specialty = route.params?.specialty ?? 'Cardiologist';

  const {engine, state, leave, toggleMute, toggleVideo, formatTimer} =
    useAgoraRtc(appointmentId);

  const openChat = () => {
    navigation.navigate('ConsultationChat', {
      doctorName,
      specialty,
      appointmentId,
    });
  };

  const endCall = async () => {
    await appointmentsApi.updateStatus(appointmentId, 'completed').catch(() => undefined);
    await leave();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.videoStreamContainer, {height: VIDEO_HEIGHT}]}>
        {state.loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Connecting to video channel…</Text>
          </View>
        ) : state.error ? (
          <View style={styles.loadingOverlay}>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        ) : state.remoteUid ? (
          <RtcSurfaceView
            style={styles.doctorFullVideoStream}
            canvas={{uid: state.remoteUid}}
          />
        ) : (
          <View style={styles.waitingRemote}>
            <Image source={DOCTOR_AVATAR} style={styles.waitingAvatar} />
            <Text style={styles.waitingText}>Waiting for {doctorName} to join…</Text>
          </View>
        )}

        <View
          style={[
            styles.doctorOverlayBadge,
            {top: insets.top + 16, left: 16, right: 16},
          ]}>
          <Image source={DOCTOR_AVATAR} style={styles.doctorOverlayAvatar} />
          <View style={styles.doctorOverlayMeta}>
            <Text style={styles.doctorOverlayName}>{doctorName}</Text>
            <View style={styles.specialtyRow}>
              <View style={styles.greenDot} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          </View>
          <Text style={styles.callTimer}>{formatTimer()}</Text>
        </View>

        {engine && state.videoEnabled ? (
          <View style={styles.userPipContainer}>
            <RtcSurfaceView style={styles.userPipImage} canvas={{uid: 0}} />
            <View style={styles.pipHardwareControls}>
              <TouchableOpacity
                style={styles.pipBadgeIconButton}
                activeOpacity={0.8}
                onPress={toggleMute}>
                <Feather
                  name={state.muted ? 'mic-off' : 'mic'}
                  size={12}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pipBadgeIconButton, styles.pipVideoOffBadge]}
                activeOpacity={0.8}
                onPress={toggleVideo}>
                <Feather
                  name={state.videoEnabled ? 'video' : 'video-off'}
                  size={12}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <View
        style={[styles.controlPanelArea, {paddingBottom: insets.bottom + 16}]}>
        <View style={styles.diagnosticGridRow}>
          <DiagnosticItem
            icon="camera"
            label="Camera"
            status={state.videoEnabled ? 'On' : 'Off'}
          />
          <DiagnosticItem
            icon="mic"
            label="Mic"
            status={state.muted ? 'Muted' : 'On'}
            withDivider
          />
          <DiagnosticItem
            icon="wifi"
            label="Network"
            status={state.joined ? 'Connected' : 'Connecting'}
            withDivider
          />
        </View>

        <Text style={styles.callDisclaimerNotice}>
          Please be ready before the call starts.{'\n'}Ensure a good internet
          connection.
        </Text>

        <View style={styles.callControlsRowContainer}>
          <View style={styles.actionControlNode}>
            <TouchableOpacity
              style={styles.secondaryCallButton}
              activeOpacity={0.85}
              onPress={toggleMute}>
              <Feather
                name={state.muted ? 'mic-off' : 'mic'}
                size={24}
                color="#1E293B"
              />
            </TouchableOpacity>
            <Text style={styles.controlActionLabel}>
              {state.muted ? 'Unmute' : 'Mute'}
            </Text>
          </View>

          <View style={styles.actionControlNode}>
            <TouchableOpacity
              style={styles.primaryDisconnectCallButton}
              activeOpacity={0.9}
              onPress={endCall}>
              <Feather name="phone-off" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.controlActionLabel}>End Call</Text>
          </View>

          <View style={styles.actionControlNode}>
            <TouchableOpacity
              style={styles.secondaryCallButton}
              activeOpacity={0.85}
              onPress={openChat}>
              <Feather name="message-square" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.controlActionLabel}>Chat with Doctor</Text>
          </View>
        </View>
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
        <Feather name={icon} size={16} color="#0D9488" />
        <Text style={styles.diagnosticLabel}>{label}</Text>
      </View>
      <View style={styles.statusCheckRow}>
        <Feather name="check" size={12} color="#0D9488" />
        <Text style={styles.statusCheckText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoStreamContainer: {
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  doctorFullVideoStream: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#E2E8F0',
    fontSize: 14,
  },
  errorText: {
    color: '#FCA5A5',
    textAlign: 'center',
    fontSize: 14,
  },
  waitingRemote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  waitingText: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  doctorOverlayBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorOverlayAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
  },
  doctorOverlayMeta: {
    marginLeft: 10,
    flex: 1,
  },
  doctorOverlayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  callTimer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    paddingRight: 6,
  },
  userPipContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#CBD5E1',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  userPipImage: {
    width: '100%',
    height: '100%',
  },
  pipHardwareControls: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  pipBadgeIconButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipVideoOffBadge: {
    backgroundColor: '#14B8A6',
  },
  controlPanelArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  diagnosticGridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 14,
  },
  diagnosticItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diagnosticLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  statusCheckText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  callDisclaimerNotice: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 24,
  },
  callControlsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 4,
  },
  actionControlNode: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.25,
  },
  secondaryCallButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 8,
  },
  primaryDisconnectCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  controlActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
});
