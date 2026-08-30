import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {
  StackActions,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {PainBodyDiagram} from '../../components/PainStatusScreen/PainBodyDiagram';
import {PainLocationChip} from '../../components/PainStatusScreen/PainLocationChip';
import { FONT } from '../../../../theme/typography';
import {
  DEFAULT_BODY_DIAGRAM,
  PAIN_LOCATIONS,
  PAIN_LOCATION_QUESTION,
} from '../../data/PainStatusScreen/painLocations';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PainStatus'>;
type Route = RouteProp<RootStackParamList, 'PainStatus'>;

export function PainStatusScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {intake} = useRoute<Route>().params;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = PAIN_LOCATIONS.find(item => item.id === selectedId);

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleContinue = () => {
    if (!selected) return;
    navigation.dispatch(
      StackActions.replace('PreviousHistoryCheck', {
        intake: {...intake, location: selected.label},
      }),
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, {paddingTop: insets.top + 12}]}>
        <AiSymptomHeaderCard onClose={closeAssistant} />

        <Text style={styles.question}>{PAIN_LOCATION_QUESTION}</Text>

        <PainBodyDiagram source={selected?.image ?? DEFAULT_BODY_DIAGRAM} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}>
          {PAIN_LOCATIONS.map(location => (
            <PainLocationChip
              key={location.id}
              label={location.label}
              selected={selectedId === location.id}
              onPress={() => setSelectedId(location.id)}
            />
          ))}
        </ScrollView>

        <View style={{paddingBottom: Math.max(insets.bottom, 16)}}>
          <GradientPillButton
            label="Continue"
            disabled={!selected}
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
    marginTop: 24,
    color: '#212121',
    fontSize: 32,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 34,
  },
  chipScroll: {
    flexGrow: 0,
    marginHorizontal: -16,
    marginVertical: 20,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
