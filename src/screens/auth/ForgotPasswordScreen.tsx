import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { FONT } from '../../theme/typography';

const AUTH_GRADIENT = ['#F5F8FC', '#E3F2F9', '#DDF0F7'] as const;

type Props = {
  onBack: () => void;
  onContinue: (contact: string) => void;
};

export function ForgotPasswordScreen({ onBack, onContinue }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Forgot password', 'Enter your email or phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(emailOrPhone.trim());
      if (res.debugCode) {
        Alert.alert('OTP sent', `Dev code: ${res.debugCode}`);
      }
      onContinue(emailOrPhone.trim());
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not send OTP';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...AUTH_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.6}
            onPress={onBack}
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={28} color="#333333" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/logoImage.png')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <View style={styles.headerPlaceholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerSection}>
              <Text style={styles.title}>Forget Password</Text>
              <Text style={styles.subtitle}>
                Enter email or Phone account to reset password
              </Text>
            </View>

            <View style={styles.formSection}>
              <Image
                source={require('../../assets/medicine_cardbg.png')}
                style={styles.formBackgroundWave}
                resizeMode="cover"
              />
              <Text style={styles.inputLabel}>Email or Phone Number</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={20}
                  color="#4A8B95"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  placeholder="Enter email or phone number"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  loading && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                disabled={loading}
                onPress={handleContinue}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.85}
                onPress={onBack}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    height: 56,
  },
  headerPlaceholder: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
    marginBottom: 24,
  },
  formBackgroundWave: {
    position: 'absolute',
    marginTop:-109,
    marginLeft: -66,
    top: 0,
    left: 0,
    width: '130%',
    height: '100%',
    opacity: 0.1,
    transform: [{ rotate: '-20deg' }],
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: '#82C3D1',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 15,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  footerSection: {
    width: '100%',
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: '#4A8B95',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4A8B95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EBEFF5',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#E06D6D',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
