import {useRef, useState} from 'react';
import {
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

const {width} = Dimensions.get('window');

const AUTH_GRADIENT = ['#F5F8FC', '#EFF7FA', '#E2F3F9'] as const;
const OTP_LENGTH = 5;
const OTP_GAP = 10;
const PIN_SIZE = (width - 48 - OTP_GAP * (OTP_LENGTH - 1)) / OTP_LENGTH;

type Props = {
  contact: string;
  onBack: () => void;
  onVerifySuccess: () => void;
};

export function VerificationScreen({
  contact,
  onBack,
  onVerifySuccess,
}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const displayContact = contact.trim() || 'yourmail@gmail.com';

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
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.waveLayerOne} />
      <View style={styles.waveLayerTwo} />

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
                style={styles.verifyButton}
                activeOpacity={0.85}
                onPress={onVerifySuccess}>
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              </TouchableOpacity>

              <View style={styles.resendMessageRow}>
                <Text style={styles.resendMutedText}>
                  Didn&apos;t you receive any code?{' '}
                </Text>
                <TouchableOpacity activeOpacity={0.6}>
                  <Text style={styles.resendHighlightLink}>
                    Resend in 30 sec
                  </Text>
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
    height: 40,
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
  title: {
    fontSize: 32,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.2,
    borderColor: '#81C1CE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#81C1CE',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pinInputField: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '700',
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
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
