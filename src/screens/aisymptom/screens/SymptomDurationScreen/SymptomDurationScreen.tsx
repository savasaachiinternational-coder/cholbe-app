import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../../navigation/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {IntakeSummary} from '../../components/shared/IntakeSummary';
import {ChoicePill} from '../../components/shared/ChoicePill';
import {
  SYMPTOM_DURATIONS,
  SYMPTOM_DURATION_QUESTION,
} from '../../data/SymptomDurationScreen/symptomDurations';
import type {SymptomIntake} from '../../data/shared/symptomIntake';
import { FONT } from '../../../../theme/typography';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'SymptomDuration'
>;
type Route = RouteProp<RootStackParamList, 'SymptomDuration'>;

export function SymptomDurationScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {title, body} = useRoute<Route>().params;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleContinue = () => {
    const duration = SYMPTOM_DURATIONS.find(item => item.id === selectedId);
    if (!duration) return;

    const intake: SymptomIntake = {title, body, duration: duration.label};
    navigation.navigate('PainStatus', {intake});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + 12},
        ]}
        showsVerticalScrollIndicator={false}>
        <AiSymptomHeaderCard onClose={closeAssistant} />

        <Text style={styles.question}>{SYMPTOM_DURATION_QUESTION}</Text>

        <IntakeSummary intake={{title, body}} />

        <View style={styles.spacer} />

        <View style={styles.optionsContainer}>
          {SYMPTOM_DURATIONS.map(duration => (
            <ChoicePill
              key={duration.id}
              label={duration.label}
              selected={selectedId === duration.id}
              onPress={() => setSelectedId(duration.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View
        style={[
          styles.ctaWrapper,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <GradientPillButton
          label="Continue"
          disabled={!selectedId}
          onPress={handleContinue}
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
    // flexGrow (not flex) lets the spacers push content apart when it is short,
    // while still allowing the content to scroll once it outgrows the screen.
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ctaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  question: {
    marginTop: 40,
    color: '#091B27',
    fontSize: 28,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 36,
  },
  spacer: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
  },
});
