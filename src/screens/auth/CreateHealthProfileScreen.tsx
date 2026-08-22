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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';

const AUTH_GRADIENT = ['#F5F8FC', '#E3F2F9', '#DDF0F7'] as const;

type Props = {
  onBack: () => void;
  onContinue: (email: string, fullName: string) => void;
  onLogin: () => void;
};

export function CreateHealthProfileScreen({
  onBack,
  onContinue,
  onLogin,
}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Create account', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Create account', 'Password must be at least 8 characters.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert(
        'Create account',
        'Please agree to the Terms & Privacy Policy.',
      );
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      onContinue(email.trim(), fullName.trim());
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Registration failed';
      Alert.alert('Registration failed', message);
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
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
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
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerSection}>
              <Text style={styles.title}>Create Health Profile</Text>
              <Text style={styles.subtitle}>Create Your Account</Text>
            </View>

            <View style={styles.formSection}>
              <Image
                source={require('../../assets/home_profile_bg.png')}
                style={styles.formBackgroundWave}
                resizeMode="cover"
              />

              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="user"
                  size={20}
                  color="#4A8B95"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={20}
                  color="#4A8B95"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <Text style={styles.inputLabel}>Create Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={20}
                  color="#4A8B95"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={secureTextEntry}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setSecureTextEntry(prev => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={
                    secureTextEntry ? 'Show password' : 'Hide password'
                  }
                >
                  <Feather
                    name={secureTextEntry ? 'eye-off' : 'eye'}
                    size={20}
                    color="#4A8B95"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                activeOpacity={0.8}
                onPress={() => setAgreeToTerms(prev => !prev)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeToTerms && (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.linkText}>Terms</Text> &{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>
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

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="apple" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.socialTextFallback, { color: '#EA4335' }]}
                  >
                    G
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginRedirectButton}
                activeOpacity={0.6}
                onPress={onLogin}
              >
                <Text style={styles.loginRedirectText}>
                  Already registered?{' '}
                  <Text style={styles.loginHighlight}>Log in here</Text>
                </Text>
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
    height: 40,
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
    paddingTop: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B3B3B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
  },
  // Bounded, clipping parent so the wave fills exactly this block.
  formSection: {
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  formBackgroundWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
    marginTop: 14,
  },
  // Transparent: the wave has to read through the field, so no white fill.
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4A8B95',
    borderRadius: 30,
    paddingHorizontal: 18,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingRight: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4A8B95',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4A8B95',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#555555',
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
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  socialTextFallback: {
    fontSize: 22,
    fontWeight: '800',
  },
  loginRedirectButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  loginRedirectText: {
    fontSize: 14,
    color: '#555555',
  },
  loginHighlight: {
    color: '#4A8B95',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
