import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {ChoicePill} from '../../components/shared/ChoicePill';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {IntakeSummary} from '../../components/shared/IntakeSummary';
import {
  PREVIOUS_HISTORY_OPTIONS,
  PREVIOUS_HISTORY_QUESTION,
} from '../../data/PreviousHistoryCheck/previousHistoryOptions';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'PreviousHistoryCheck'
>;
type Route = RouteProp<RootStackParamList, 'PreviousHistoryCheck'>;

export function PreviousHistoryCheck() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {intake} = useRoute<Route>().params;
  const [haveInPrevious, setHaveInPrevious] = useState<boolean | null>(null);

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleContinue = () => {
    // `false` is a valid answer, so check for an unanswered question explicitly.
    if (haveInPrevious === null) return;
    navigation.navigate('Ideation', {
      intake: {...intake, haveInPrevious},
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, {paddingTop: insets.top + 12}]}>
        <AiSymptomHeaderCard onClose={closeAssistant} />

        <Text style={styles.question}>{PREVIOUS_HISTORY_QUESTION}</Text>

        <IntakeSummary intake={intake} />

        <View style={styles.spacer} />

        <View style={styles.optionsRow}>
          {PREVIOUS_HISTORY_OPTIONS.map(option => (
            <View key={option.id} style={styles.optionSlot}>
              <ChoicePill
                label={option.label}
                selected={haveInPrevious === option.value}
                onPress={() => setHaveInPrevious(option.value)}
              />
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={{paddingBottom: Math.max(insets.bottom, 16)}}>
          <GradientPillButton
            label="Continue"
            disabled={haveInPrevious === null}
            onPress={handleContinue}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  question: {
    marginTop: 40,
    color: '#091B27',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  spacer: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionSlot: {
    flex: 1,
  },
});
