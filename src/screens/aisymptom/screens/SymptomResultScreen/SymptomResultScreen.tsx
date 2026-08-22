import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {DoctorProductCard} from '../../../../components/DoctorProductCard';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {ConditionCard} from '../../components/SymptomResultScreen/ConditionCard';
import {
  RESULT_CTA_LABEL,
  RESULT_HEADING,
  RESULT_SUBHEADING,
  SUGGESTED_DOCTORS_HEADING,
} from '../../data/SymptomResultScreen/symptomResults';
import {formatBdt} from '../../../../utils/pharmacyHelpers';
import {useSymptomAnalysis} from './useSymptomAnalysis';
import {useSuggestedDoctors} from './useSuggestedDoctors';

// Matches the two-column grid on DoctorListScreen.
const SCREEN_WIDTH = Dimensions.get('window').width;
const DOCTOR_CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'SymptomResult'
>;
type Route = RouteProp<RootStackParamList, 'SymptomResult'>;

const RESULT_ERROR_HEADING = "I couldn't work that out";

/** The API returns a raw amount; the card wants it already formatted. */
function formatFee(fee: string | number): string {
  const amount = typeof fee === 'string' ? Number(fee) : fee;
  return Number.isNaN(amount) ? String(fee) : formatBdt(amount);
}

export function SymptomResultScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {intake} = useRoute<Route>().params;
  const {status, conditions, specialties, errorMessage, retry} =
    useSymptomAnalysis(intake);
  const {doctors, loading: doctorsLoading} = useSuggestedDoctors(
    conditions,
    specialties,
  );

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleSeeNext = () => {
    navigation.navigate('IdeationNext');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={{marginTop: insets.top + 12}}>
          <AiSymptomHeaderCard onClose={closeAssistant} />
        </View>

        <Text style={styles.heading}>
          {status === 'error' ? RESULT_ERROR_HEADING : RESULT_HEADING}
        </Text>
        <Text style={styles.subheading}>
          {status === 'error' ? errorMessage : RESULT_SUBHEADING}
        </Text>

        {status === 'loading' ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator size="large" color="#45A096" />
            <Text style={styles.stateLabel}>Reading your answers…</Text>
          </View>
        ) : null}

        {status === 'error' ? (
          <View style={styles.stateBlock}>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.85}
              onPress={retry}>
              <Text style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {status === 'ready' ? (
          <View style={styles.conditionList}>
            {conditions.map(condition => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
          </View>
        ) : null}

        {/* An empty section under a heading reads as broken, so both are
            hidden until there is something to show. */}
        {doctorsLoading || doctors.length ? (
          <>
            <Text style={styles.sectionHeading}>
              {SUGGESTED_DOCTORS_HEADING}
            </Text>
            {doctorsLoading ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator size="small" color="#45A096" />
              </View>
            ) : (
              <View style={styles.doctorGrid}>
                {doctors.map(doctor => (
                  <View key={doctor.id} style={{width: DOCTOR_CARD_WIDTH}}>
                    <DoctorProductCard
                      name={doctor.user.fullName}
                      specialty={doctor.specialty}
                      degree={doctor.degree ?? undefined}
                      fee={formatFee(doctor.fee)}
                      rating={doctor.reviewAverage}
                      reviewCount={doctor.reviewCount}
                      image={
                        doctor.imageUrl ? {uri: doctor.imageUrl} : undefined
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.ctaWrapper,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <GradientPillButton
          label={RESULT_CTA_LABEL}
          onPress={handleSeeNext}
          disabled={status !== 'ready'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heading: {
    marginTop: 24,
    color: '#091B27',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subheading: {
    marginTop: 10,
    color: '#454F5B',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  conditionList: {
    marginTop: 18,
    gap: 12,
  },
  stateBlock: {
    marginTop: 32,
    alignItems: 'center',
    gap: 14,
  },
  stateLabel: {
    color: '#454F5B',
    fontSize: 13,
    fontWeight: '400',
  },
  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#45A096',
  },
  retryLabel: {
    color: '#45A096',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeading: {
    marginTop: 26,
    color: '#091B27',
    fontSize: 18,
    fontWeight: '700',
  },
  doctorGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  ctaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
