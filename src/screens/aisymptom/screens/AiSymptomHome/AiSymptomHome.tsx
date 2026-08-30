import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEdgeToEdgeStatusBar } from '../../../../hooks/useEdgeToEdgeStatusBar';
import { useKeyboardHeight } from '../../../../hooks/useKeyboardHeight';
import { getStoredUser } from '../../../../api/tokenStorage';
import {
  AiHelpCategoryCard,
  CATEGORY_GRID_GAP,
} from '../../components/AiSymptomHome/AiHelpCategoryCard';
import { AiSymptomHeaderCard } from '../../components/shared/AiSymptomHeaderCard';
import { AiSymptomComposer } from '../../components/AiSymptomHome/AiSymptomComposer';
import { AI_HELP_CATEGORIES } from '../../data/AiSymptomHome/aiHelpCategories';
import { useAiSymptomComposer, type AiSymptomDraft } from './useAiSymptomComposer';
import { FONT } from '../../../../theme/typography';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'AiSymptomHome'
>;
type Route = RouteProp<RootStackParamList, 'AiSymptomHome'>;

export function AiSymptomHome() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then(user => {
        if (active) setUserName(user?.fullName ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const submitDraft = useCallback(
    (draft: AiSymptomDraft) => {
      navigation.navigate('SymptomDuration', {
        title: draft.categories.join(', '),
        body: draft.message,
      });
    },
    [navigation],
  );

  const composer = useAiSymptomComposer(submitDraft);
  const { ingestScannedFile } = composer;
  const scannedFile = route.params?.scannedFile;

  useEffect(() => {
    if (!scannedFile) return;
    ingestScannedFile(scannedFile);
    navigation.setParams({ scannedFile: undefined });
  }, [scannedFile, ingestScannedFile, navigation]);

  const closeAssistant = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.marginatedContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: insets.top + 12 }}>
          <AiSymptomHeaderCard onClose={closeAssistant} />
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Hi!{userName ? ` ${userName}` : ''}
          </Text>
          <Text style={styles.greetingSubtitle}>
            I'm your smart assistant. Ready when you are.
          </Text>
        </View>

        <View style={styles.helpCardContainer}>
          {AI_HELP_CATEGORIES.map(item => (
            <AiHelpCategoryCard
              key={item.title}
              image={item.image}
              title={item.title}
              selected={composer.categories.includes(item.title)}
              onPress={composer.selectCategory}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composerWrapper,
          { paddingBottom: Math.max(insets.bottom, 12) + keyboardHeight },
        ]}
      >
        <AiSymptomComposer
          message={composer.message}
          onChangeMessage={composer.setMessage}
          attachment={composer.attachment}
          scanning={composer.scanning}
          scanLabel={composer.scanLabel}
          onPickAttachment={composer.pickAttachment}
          onRemoveAttachment={composer.removeAttachment}
          voiceNote={composer.voiceNote}
          onRemoveVoiceNote={composer.removeVoiceNote}
          recording={composer.recording}
          recordLabel={composer.recordLabel}
          onToggleRecording={composer.toggleRecording}
          onCancelRecording={composer.cancelRecording}
          canSend={composer.canSend}
          onSend={composer.send}
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
  marginatedContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  greetingContainer: {
    marginTop: 20,
  },
  greetingTitle: {
    color: '#091B27',
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  greetingSubtitle: {
    marginTop: 4,
    width: '100%',
    color: '#454F5B',
    fontSize: 15,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 22,
  },
  helpCardContainer: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CATEGORY_GRID_GAP,
  },
  composerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
