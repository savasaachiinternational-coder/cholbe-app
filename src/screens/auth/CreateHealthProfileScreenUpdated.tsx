
import {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';

const AUTH = {
  gradient: ['#F5F8FC', '#E3F2F9', '#DDF0F7'],
  accent: '#4A8B95',
  ink: '#333333',
  inkSoft: '#555555',
  inkMuted: '#666666',
  placeholder: '#A0A0A0',
  field: '#3EA08F',
  fieldIcon: '#2E9E8F',
  white: '#FFFFFF',
} as const;

const GRADIENT_COLORS = [...AUTH.gradient];
const GRADIENT_START = {x: 0, y: 0};
const GRADIENT_END = {x: 1, y: 1};
const EYE_HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};
const LOGO = require('../../assets/logo.png');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Props = {
  onBack: () => void;
  onContinue: (email: string, fullName: string) => void;
  onLogin: () => void;
};

export function CreateHealthProfileScreenUpdated({
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

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const aliveRef = useRef(true);

  const toggleSecure = useCallback(() => setSecureTextEntry(p => !p), []);
  const toggleTerms = useCallback(() => setAgreeToTerms(p => !p), []);
  const focusEmail = useCallback(() => emailRef.current?.focus(), []);
  const focusPassword = useCallback(() => passwordRef.current?.focus(), []);

  const handleContinue = useCallback(async () => {
    const name = fullName.trim();
    const mail = email.trim();

    if (!name || !mail || !password) {
      Alert.alert('Create account', 'Please fill in all fields.');
      return;
    }
    if (!EMAIL_RE.test(mail)) {
      Alert.alert('Create account', 'Please enter a valid email address.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(
        'Create account',
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
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
      await authApi.register({fullName: name, email: mail, password});
      aliveRef.current = false;
      onContinue(mail, name);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Registration failed';
      Alert.alert('Registration failed', message);
    } finally {
      if (aliveRef.current) {
        setLoading(false);
      }
    }
  }, [fullName, email, password, agreeToTerms, onContinue]);

  const screenStyle = useMemo(
    () => [styles.screen, {paddingTop: insets.top}],
    [insets.top],
  );
  const scrollStyle = useMemo(
    () => [styles.scrollContent, {paddingBottom: insets.bottom + 32}],
    [insets.bottom],
  );
  const continueStyle = useMemo(
    () => (loading ? [styles.continueButton, styles.buttonDisabled] : styles.continueButton),
    [loading],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={StyleSheet.absoluteFill}
      />

      <View style={screenStyle}>
        <AuthHeaderBar logo={LOGO} onBack={onBack} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={scrollStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.headerSection}>
              <Text style={styles.title}>Create Health Profile</Text>
              <Text style={styles.subtitle}>Create Your Account</Text>
            </View>

            <View style={styles.formSection}>
               <Image
                source={require('../../assets/medicine_cardbg.png')}
                style={styles.formBackgroundWave}
                resizeMode="cover"
              />
              <AuthField
                label="Full Name"
                icon="account"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={focusEmail}
              />

              <AuthField
                inputRef={emailRef}
                label="Email Address"
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={focusPassword}
              />

              <AuthField
                inputRef={passwordRef}
                label="Create Password"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
                autoCapitalize="none"
                secureTextEntry={secureTextEntry}
                onToggleSecure={toggleSecure}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
              />

              <TermsCheckbox checked={agreeToTerms} onToggle={toggleTerms} />
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity
                style={continueStyle}
                activeOpacity={0.85}
                disabled={loading}
                onPress={handleContinue}>
                {loading ? (
                  <ActivityIndicator color={AUTH.white} />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              <SocialLoginRow />

              <TouchableOpacity
                style={styles.loginRedirectButton}
                activeOpacity={0.6}
                onPress={onLogin}>
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


const AuthHeaderBar = memo(function AuthHeaderBar({
  logo,
  onBack,
}: {
  logo:ImageSourcePropType;
  onBack: () => void;
}) {
  return (
    <View style={styles.headerBar}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.6}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <Feather name="chevron-left" size={28} color={AUTH.ink} />
      </TouchableOpacity>
      <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
      <View style={styles.headerPlaceholder} />
    </View>
  );
});

type AuthFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  icon: string;
  inputRef?: React.RefObject<TextInput | null>;
  onToggleSecure?: () => void;
};

const AuthField = memo(function AuthField({
  label,
  icon,
  inputRef,
  onToggleSecure,
  secureTextEntry,
  ...inputProps
}: AuthFieldProps) {
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={AUTH.fieldIcon}
          style={styles.inputIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={AUTH.placeholder}
          secureTextEntry={secureTextEntry}
          {...inputProps}
        />
        {onToggleSecure && (
          <TouchableOpacity
            onPress={onToggleSecure}
            hitSlop={EYE_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={
              secureTextEntry ? 'Show password' : 'Hide password'
            }>
            <MaterialCommunityIcons
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={22}
              color={AUTH.fieldIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
});

const TermsCheckbox = memo(function TermsCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  const boxStyle = useMemo<StyleProp<ViewStyle>>(
    () => (checked ? [styles.checkbox, styles.checkboxChecked] : styles.checkbox),
    [checked],
  );

  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{checked}}
      onPress={onToggle}>
      <View style={boxStyle}>
        {checked && <Feather name="check" size={12} color={AUTH.white} />}
      </View>
      <Text style={styles.checkboxLabel}>
        By signing up, you agree to our{' '}
        <Text style={styles.linkText}>Terms</Text> &{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>.
      </Text>
    </TouchableOpacity>
  );
});


const SocialLoginRow = memo(function SocialLoginRow() {
  return (
    <View style={styles.socialRow}>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
        <FontAwesome name="apple" size={24} color="#000000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
        <Text style={styles.socialTextGoogle}>G</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
        <FontAwesome name="facebook" size={24} color="#1877F2" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.gradient[0],
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
  formSection: {
    marginBottom: 20,
  },
  
  formBackgroundWave: {
    position: 'absolute',
    marginLeft:-66,
    top: 0,
    left: 0,
    width: '130%',
    height: '100%',
    opacity: .1,
    transform: [{rotate: '-20deg'}],

  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 10,
    marginTop: 14,
  },
  // Transparent so the wave reads through, with the design's teal outline.
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AUTH.field,
    borderRadius: 30,
    paddingHorizontal: 18,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#212121',
    fontSize: 16,
    fontWeight: '400',
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
    borderColor: AUTH.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: AUTH.accent,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: AUTH.inkMuted,
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: AUTH.inkSoft,
    fontWeight: '500',
  },
  footerSection: {
    width: '100%',
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: AUTH.accent,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AUTH.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: AUTH.white,
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
    color: AUTH.ink,
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
    backgroundColor: AUTH.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  socialTextGoogle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EA4335',
  },
  loginRedirectButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  loginRedirectText: {
    fontSize: 14,
    color: AUTH.inkSoft,
  },
  loginHighlight: {
    color: AUTH.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
