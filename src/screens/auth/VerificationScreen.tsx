import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';

const {width} = Dimensions.get('window');

const AUTH_GRADIENT = ['#F8FAFC', '#E4F2F4', '#C9E7EA', '#E9F4F6'] as const;
const AUTH_GRADIENT_STOPS = [0, 0.35, 0.62, 1];
const OTP_LENGTH = 5;
const OTP_GAP = 10;
const PIN_SIZE = (width - 48 - OTP_GAP * (OTP_LENGTH - 1)) / OTP_LENGTH;

type Props = {
  contact: string;
  flow: 'register' | 'forgotPassword';
  onBack: () => void;
  onVerifySuccess: (code: string) => void;
};

export function VerificationScreen({
  contact,
  flow: _flow,
  onBack,
  onVerifySuccess,
}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const displayContact = contact.trim() || 'yourmail@gmail.com';

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Verification', 'Please enter the full OTP code.');
      return;
    }
    if (_flow === 'forgotPassword') {
      onVerifySuccess(code);
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp(contact, code);
      onVerifySuccess(code);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid OTP';
      Alert.alert('Verification failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authApi.sendOtp(contact);
      if (res.debugCode) {
        Alert.alert('OTP sent', `Dev code: ${res.debugCode}`);
      } else {
        Alert.alert('OTP sent', 'A new code has been sent.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not resend OTP';
      Alert.alert('Error', message);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...AUTH_GRADIENT]}
        locations={AUTH_GRADIENT_STOPS}
        start={{x: 0.15, y: 0}}
        end={{x: 0.85, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      {/* <View style={styles.waveLayerOne} />
      <View style={styles.waveLayerTwo} /> */}

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
            source={require('../../assets/logoImage.png')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.6}
            accessibilityLabel="Notifications">
            <Feather name="bell" size={24} color="rgba(0,0,0,0.06)" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: insets.bottom + 24},
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.textSection}>
               <Image
                              source={require('../../assets/medicine_cardbg.png')}
                              style={styles.formBackgroundWave}
                              resizeMode="cover"
                            />
              <Text style={styles.title}>Verification Code</Text>
              <Text style={styles.subtitle}>
                We have sent a code to{' '}
                <Text style={styles.emailHighlight}>{displayContact}</Text>
              </Text>
            </View>

            <View style={styles.otpOuterWrapper}>
              <View style={styles.otpGrid}>
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinCircleContainer,
                      {width: PIN_SIZE, height: PIN_SIZE},
                    ]}>
                    <TextInput
                      ref={el => {
                        inputRefs.current[index] = el;
                      }}
                      style={styles.pinInputField}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      textAlign="center"
                      placeholderTextColor="rgba(0,0,0,0.15)"
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                activeOpacity={0.85}
                disabled={loading}
                onPress={handleVerify}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendMessageRow}>
                <Text style={styles.resendMutedText}>
                  Didn&apos;t you receive any code?{' '}
                </Text>
                <TouchableOpacity activeOpacity={0.6} onPress={handleResend}>
                  <Text style={styles.resendHighlightLink}>Resend code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_GRADIENT[0],
  },
  waveLayerOne: {
    position: 'absolute',
    top: '20%',
    left: '-20%',
    width: width * 1.5,
    height: width * 1.2,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{rotate: '-15deg'}],
    zIndex: 0,
  },
  waveLayerTwo: {
    position: 'absolute',
    top: '22%',
    right: '-30%',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: (width * 1.4) / 2,
    backgroundColor: 'rgba(217, 243, 247, 0.45)',
    zIndex: 0,
  },
  screen: {
    flex: 1,
    zIndex: 5,
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
    height: 50,
  },
  notificationButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  textSection: {
    marginBottom: 44,
  },
    formBackgroundWave: {
    position: 'absolute',
    marginTop:130,
    marginLeft:-66,
    top: 0,
    left: 0,
    width: '130%',
    height: '100%',
    opacity: .1,
    transform: [{rotate: '-10deg'}],

  },
  title: {
    fontSize: 32,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3B3B3B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#444444',
  },
  otpOuterWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  otpGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: OTP_GAP,
  },
  pinCircleContainer: {
    borderRadius: 100,
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: '#81C1CE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInputField: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3B3B3B',
    padding: 0,
  },
  footerSection: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 40,
  },
  verifyButton: {
    backgroundColor: '#4A8B95',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4A8B95',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  resendMessageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resendMutedText: {
    fontSize: 14,
    color: '#707070',
  },
  resendHighlightLink: {
    fontSize: 14,
    color: '#333333',
    fontFamily: FONT.semibold,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
