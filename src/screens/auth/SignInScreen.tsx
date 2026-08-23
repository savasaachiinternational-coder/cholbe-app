import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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

const SIGN_IN_GRADIENT = ['#F5F8FC', '#E3F2F9', '#DDF0F7'] as const;

type Props = {
  onSignInSuccess: (role: string) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
};

export function SignInScreen({
  onSignInSuccess,
  onForgotPassword,
  onCreateAccount,
}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!emailOrPhone.trim() || !password) {
      Alert.alert('Sign in', 'Please enter email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(emailOrPhone.trim(), password);
      onSignInSuccess(res.user.role);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Sign in failed';
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...SIGN_IN_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter email or Phone Number</Text>
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

            <Text style={styles.inputLabel}>Password</Text>
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
                placeholder="Enter password"
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
              style={styles.forgotPasswordButton}
              activeOpacity={0.6}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.buttonDisabled]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleSignIn}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpLink}
            activeOpacity={0.6}
            onPress={onCreateAccount}
          >
            <Text style={styles.signUpText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.signUpHighlight}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          {/* TODO(release): restore social login (Apple / Google / Facebook)
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <FontAwesome name="apple" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Text style={[styles.socialTextFallback, { color: '#EA4335' }]}>
                G
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <FontAwesome name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
          */}

          <TouchableOpacity
            style={styles.privacyContainer}
            activeOpacity={0.7}
            onPress={() => void Linking.openURL(LEGAL_URLS.privacy)}
          >
            <Feather
              name="shield"
              size={14}
              color="#707070"
              style={styles.privacyIcon}
            />
            <Text style={styles.privacyText}>
              Your data is private & encrypted · Privacy Policy
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SIGN_IN_GRADIENT[0],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: 180,
    height: 56,
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B3B3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
  },
  formSection: {
    marginBottom: 24,
  },
  formBackgroundWave: {
    position: 'absolute',
    marginLeft: -26,
    top: 0,
    left: 0,
    width: '160%',
    height: '100%',
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
    marginTop: 16,
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
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: '#4A8B95',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4A8B95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 4,
  },
  signUpText: {
    fontSize: 14,
    color: '#555555',
  },
  signUpHighlight: {
    color: '#4A8B95',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
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
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  privacyIcon: {
    marginRight: 6,
  },
  privacyText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
});
