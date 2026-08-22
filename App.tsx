import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {Alert, StatusBar, useColorScheme} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {hasSession, getStoredUser, clearSession, getIsFirtTime, setIsFirtTime} from './src/api/tokenStorage';
import {setLogoutHandler} from './src/auth/sessionControl';
import {getHomeRouteForRole} from './src/navigation/roleRoutes';
import type {RootStackParamList} from './src/navigation/types';
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
import {MedicationDraftProvider} from './src/context/MedicationDraftContext';
import {NotificationProvider} from './src/context/NotificationContext';
import {OnboardingScreen} from './src/screens/onboarding/OnboardingScreen';
import {SplashScreen} from './src/screens/onboarding/SplashScreen';
import { CreateHealthProfileScreenUpdated } from './src/screens/auth/CreateHealthProfileScreenUpdated';

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
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Home');
  const [verificationContact, setVerificationContact] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [verifiedOtpCode, setVerifiedOtpCode] = useState('');
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>('forgotPassword');

  const enterMainApp = useCallback(async (role?: string) => {
    if (role) {
      setInitialRoute(getHomeRouteForRole(role));
    } else {
      const user = await getStoredUser();
      setInitialRoute(getHomeRouteForRole(user?.role));
    }
    setPhase('main');
  }, []);

  const handleSplashFinish = useCallback(async () => {
    const loggedIn = await hasSession();
    const isFirstTime = await getIsFirtTime();
    if (loggedIn) {
      await enterMainApp();
      return;
    }
    if(!isFirstTime){
      setPhase('onboarding');
      return;
    }
    setPhase('signIn');
    
  }, [enterMainApp]);

  const handleGoToSignIn = useCallback(() => {
    setPhase('signIn');
  }, []);
  //changed
  const handleOnboardingFinish = useCallback(() => {
    setPhase('signIn');
    setIsFirtTime()
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

  const handleVerifySuccess = useCallback((code: string) => {
    setVerifiedOtpCode(code);
    setPhase('createNewPassword');
  }, []);

  const handleRegisterVerifySuccess = useCallback((_code: string) => {
    setPhase('patientInformation');
  }, []);

  const handlePatientInfoContinue = useCallback(() => {
    setPhase('medicalHistory');
  }, []);

  const handleBackToPatientInfo = useCallback(() => {
    setPhase('patientInformation');
  }, []);

  const handleRegistrationComplete = useCallback(() => {
    enterMainApp('CUSTOMER');
  }, [enterMainApp]);

  const handleBackToVerification = useCallback(() => {
    setPhase('verification');
  }, []);

  const handlePasswordResetComplete = useCallback(() => {
    setVerifiedOtpCode('');
    setPhase('signIn');
  }, []);

  const handleSignInSuccess = useCallback(
    (role: string) => {
      enterMainApp(role);
    },
    [enterMainApp],
  );

  const handleLogout = useCallback(async () => {
    await clearSession();
    setPhase('signIn');
  }, []);

  useEffect(() => {
    setLogoutHandler(handleLogout);
  }, [handleLogout]);

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
          onFinish={handleOnboardingFinish}
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
        <CreateHealthProfileScreenUpdated
          onBack={handleBackToSignIn}
          onLogin={handleBackToSignIn}
          onContinue={handleRegisterContinue}
        />
      )}
      {phase === 'otpVerificationMethod' && (
        <OTPVerificationMethodScreen
          contact={verificationContact}
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
          flow={verificationFlow}
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
          contact={verificationContact}
          otpCode={verifiedOtpCode}
          onBack={handleBackToVerification}
          onContinue={handlePasswordResetComplete}
        />
      )}
      {phase === 'main' && (
        <NavigationContainer theme={isDarkMode ? DarkTheme : navigationTheme}>
          <NotificationProvider>
            <MedicationDraftProvider>
              <RootNavigator initialRouteName={initialRoute} />
            </MedicationDraftProvider>
          </NotificationProvider>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

export default App;
