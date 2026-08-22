import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../../navigation/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import {getStoredUser} from '../../../../api/tokenStorage';
import {
  AiHelpCategoryCard,
  CATEGORY_GRID_GAP,
} from '../../components/AiSymptomHome/AiHelpCategoryCard';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {AiSymptomComposer} from '../../components/AiSymptomHome/AiSymptomComposer';
import {AI_HELP_CATEGORIES} from '../../data/AiSymptomHome/aiHelpCategories';
import {useAiSymptomComposer} from './useAiSymptomComposer';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'AiSymptomHome'>;

export function AiSymptomHome() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
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

  const composer = useAiSymptomComposer(draft => {
    navigation.navigate('SymptomDuration', {
      title: draft.categories.join(', '),
      body: draft.message,
    });
  });

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.marginatedContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{marginTop: insets.top + 12}}>
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

        {/* TEMPORARY — dev entry point for the DocScanner spike. Remove this
            block (and the docScannerLink styles) once the real entry point
            exists in the composer. */}
        <TouchableOpacity
          style={styles.docScannerLink}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DocScanner')}>
          <Feather name="file-text" size={18} color="#45A096" />
          <Text style={styles.docScannerLinkLabel}>
            Scan a prescription or lab report
          </Text>
          <Feather name="chevron-right" size={18} color="#45A096" />
        </TouchableOpacity>

        <View style={styles.helpCardContainer}>
          {AI_HELP_CATEGORIES.map((item, index) => (
            <AiHelpCategoryCard
              key={`${item.title}-${index}`}
              image={item.image}
              title={item.title}
              selected={composer.categories.includes(item.title)}
              onPress={() => composer.selectCategory(item.title)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composerWrapper,
          {paddingBottom: Math.max(insets.bottom, 12)},
        ]}>
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
    </KeyboardAvoidingView>
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
    fontWeight: '700',
  },
  greetingSubtitle: {
    marginTop: 4,
    width: '100%',
    color: '#454F5B',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  // TEMPORARY — paired with the DocScanner dev link above.
  docScannerLink: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#45A096',
  },
  docScannerLinkLabel: {
    flex: 1,
    color: '#091B27',
    fontSize: 14,
    fontWeight: '600',
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
