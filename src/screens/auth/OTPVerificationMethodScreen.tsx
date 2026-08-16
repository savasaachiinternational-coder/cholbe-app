import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';

const AUTH_GRADIENT = ['#F5F8FC', '#E3F2F9', '#DDF0F7'] as const;

export type OtpDeliveryMethod = 'sms' | 'email';

type Props = {
  contact: string;
  onBack: () => void;
  onSelectMethod: (method: OtpDeliveryMethod) => void;
};

export function OTPVerificationMethodScreen({contact, onBack, onSelectMethod}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (method: OtpDeliveryMethod) => {
    setLoading(true);
    try {
      const channel = method === 'sms' ? 'SMS' : 'EMAIL';
      const res = await authApi.sendOtp(contact, channel);
      if (res.debugCode) {
        Alert.alert('OTP sent', `Dev code: ${res.debugCode}`);
      }
      onSelectMethod(method);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not send OTP';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...AUTH_GRADIENT]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.screen, {paddingTop: insets.top}]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.6}
            onPress={onBack}
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={28} color="#333333" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerPlaceholder} />
        </View>

        <View
          style={[
            styles.contentContainer,
            {paddingBottom: insets.bottom + 24},
          ]}>
          <View style={styles.badgeSection}>
            <View style={styles.lockBadgeWrapper}>
              <Feather name="lock" size={26} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
              The OTP code will be sent to you through the method you select
            </Text>
          </View>

          <View style={styles.selectionSection}>
            <TouchableOpacity
              style={[styles.smsButton, loading && styles.buttonDisabled]}
              activeOpacity={0.85}
              disabled={loading}
              onPress={() => handleSelect('sms')}>
              <Feather
                name="smartphone"
                size={22}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.smsButtonText}>Send OTP via SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emailButton, loading && styles.buttonDisabled]}
              activeOpacity={0.85}
              disabled={loading}
              onPress={() => handleSelect('email')}>
              <Feather
                name="message-square"
                size={22}
                color="#1E293B"
                style={styles.buttonIcon}
              />
              <Text style={styles.emailButtonText}>Send OTP via Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_GRADIENT[0],
  },
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 4,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerPlaceholder: {
    width: 36,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  badgeSection: {
    marginTop: 40,
    marginBottom: 32,
  },
  lockBadgeWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#3CD886',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3CD886',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B3B3B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  selectionSection: {
    width: '100%',
  },
  smsButton: {
    flexDirection: 'row',
    backgroundColor: '#4B9F9A',
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4B9F9A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  smsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.2,
    borderColor: '#82C3D1',
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
