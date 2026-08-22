import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {IntakeSummary} from '../../components/shared/IntakeSummary';
import {IDEATION_MESSAGE} from '../../data/IdeationScreen/ideationCopy';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Ideation'>;
type Route = RouteProp<RootStackParamList, 'Ideation'>;

export function IdeationScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {intake} = useRoute<Route>().params;

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate('SymptomResult', {intake});
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16},
        ]}>
        <AiSymptomHeaderCard onClose={closeAssistant} />

        <View style={styles.center}>
          <Image
            source={require('../../../../assets/syaiicon.png')}
            style={styles.aiIcon}
          />
          <Text style={styles.message}>{IDEATION_MESSAGE}</Text>
          <IntakeSummary intake={intake} />
        </View>

        <GradientPillButton label="Continue" onPress={handleContinue} />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:20,
  },
  aiIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  message: {
    marginTop: 16,
    color: '#091B27',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
});
