import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {CreateHealthProfileScreen} from './src/screens/auth/CreateHealthProfileScreen';
import {CreateNewPasswordScreen} from './src/screens/auth/CreateNewPasswordScreen';
import {ForgotPasswordScreen} from './src/screens/auth/ForgotPasswordScreen';
import {
  OTPVerificationMethodScreen,
  type OtpDeliveryMethod,
} from './src/screens/auth/OTPVerificationMethodScreen';
import {SignInScreen} from './src/screens/auth/SignInScreen';
import {MedicalHistoryScreen} from './src/screens/auth/MedicalHistoryScreen';
import {PatientInformationScreen} from './src/screens/auth/PatientInformationScreen';
import {VerificationScreen} from './src/screens/auth/VerificationScreen';
import {RootNavigator} from './src/navigation/RootNavigator';
import {OnboardingScreen} from './src/screens/onboarding/OnboardingScreen';
import {SplashScreen} from './src/screens/onboarding/SplashScreen';

type AppPhase =
  | 'splash'
  | 'onboarding'
  | 'signIn'
  | 'register'
  | 'otpVerificationMethod'
  | 'forgotPassword'
  | 'verification'
  | 'patientInformation'
  | 'medicalHistory'
  | 'createNewPassword'
  | 'main';

type VerificationFlow = 'register' | 'forgotPassword';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
  },
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [phase, setPhase] = useState<AppPhase>('splash');
  const [verificationContact, setVerificationContact] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>('forgotPassword');

  const handleSplashFinish = useCallback(() => {
    setPhase('onboarding');
  }, []);

  const handleGoToSignIn = useCallback(() => {
    setPhase('signIn');
  }, []);

  const handleForgotPassword = useCallback(() => {
    setPhase('forgotPassword');
  }, []);

  const handleGoToRegister = useCallback(() => {
    setPhase('register');
  }, []);

  const handleRegisterContinue = useCallback(
    (email: string, fullName: string) => {
      setVerificationContact(email);
      setRegisterName(fullName);
      setVerificationFlow('register');
      setPhase('otpVerificationMethod');
    },
    [],
  );

  const handleBackToRegister = useCallback(() => {
    setPhase('register');
  }, []);

  const handleOtpMethodSelected = useCallback((_method: OtpDeliveryMethod) => {
    setPhase('verification');
  }, []);

  const handleBackToSignIn = useCallback(() => {
    setPhase('signIn');
  }, []);

  const handleContinueToVerification = useCallback((contact: string) => {
    setVerificationContact(contact);
    setVerificationFlow('forgotPassword');
    setPhase('verification');
  }, []);

  const handleBackToForgotPassword = useCallback(() => {
    setPhase('forgotPassword');
  }, []);

  const handleBackToOtpMethod = useCallback(() => {
    setPhase('otpVerificationMethod');
  }, []);

  const handleVerifySuccess = useCallback(() => {
    setPhase('createNewPassword');
  }, []);

  const handleRegisterVerifySuccess = useCallback(() => {
    setPhase('patientInformation');
  }, []);

  const handlePatientInfoContinue = useCallback(() => {
    setPhase('medicalHistory');
  }, []);

  const handleBackToPatientInfo = useCallback(() => {
    setPhase('patientInformation');
  }, []);

  const handleRegistrationComplete = useCallback(() => {
    setPhase('main');
  }, []);

  const handleBackToVerification = useCallback(() => {
    setPhase('verification');
  }, []);

  const handlePasswordResetComplete = useCallback(() => {
    setPhase('signIn');
  }, []);

  const handleSignInSuccess = useCallback(() => {
    setPhase('main');
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {phase === 'splash' && <SplashScreen onFinish={handleSplashFinish} />}
      {phase === 'onboarding' && (
        <OnboardingScreen
          onFinish={handleGoToSignIn}
          onSignIn={handleGoToSignIn}
        />
      )}
      {phase === 'signIn' && (
        <SignInScreen
          onSignInSuccess={handleSignInSuccess}
          onForgotPassword={handleForgotPassword}
          onCreateAccount={handleGoToRegister}
        />
      )}
      {phase === 'register' && (
        <CreateHealthProfileScreen
          onBack={handleBackToSignIn}
          onLogin={handleBackToSignIn}
          onContinue={handleRegisterContinue}
        />
      )}
      {phase === 'otpVerificationMethod' && (
        <OTPVerificationMethodScreen
          onBack={handleBackToRegister}
          onSelectMethod={handleOtpMethodSelected}
        />
      )}
      {phase === 'forgotPassword' && (
        <ForgotPasswordScreen
          onBack={handleBackToSignIn}
          onContinue={handleContinueToVerification}
        />
      )}
      {phase === 'verification' && (
        <VerificationScreen
          contact={verificationContact}
          onBack={
            verificationFlow === 'register'
              ? handleBackToOtpMethod
              : handleBackToForgotPassword
          }
          onVerifySuccess={
            verificationFlow === 'register'
              ? handleRegisterVerifySuccess
              : handleVerifySuccess
          }
        />
      )}
      {phase === 'patientInformation' && (
        <PatientInformationScreen
          initialName={registerName}
          onContinue={handlePatientInfoContinue}
        />
      )}
      {phase === 'medicalHistory' && (
        <MedicalHistoryScreen
          onBack={handleBackToPatientInfo}
          onComplete={handleRegistrationComplete}
        />
      )}
      {phase === 'createNewPassword' && (
        <CreateNewPasswordScreen
          onBack={handleBackToVerification}
          onContinue={handlePasswordResetComplete}
        />
      )}
      {phase === 'main' && (
        <NavigationContainer theme={isDarkMode ? DarkTheme : navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

export default App;
