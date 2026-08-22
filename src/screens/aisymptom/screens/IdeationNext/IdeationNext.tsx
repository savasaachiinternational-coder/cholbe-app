import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {SecondaryPillButton} from '../../components/shared/SecondaryPillButton';
import {AdviceCard} from '../../components/IdeationNext/AdviceCard';
import {TelemedicinePromoBanner} from '../../components/IdeationNext/TelemedicinePromoBanner';
import {
  BOOK_DOCTOR_LABEL,
  IDEATION_NEXT_HEADING,
  NEARBY_LABS_LABEL,
  OTC_SUGGESTIONS,
  SELF_CARE_TIPS,
  TELEMEDICINE_PROMO,
} from '../../data/IdeationNext/ideationNextContent';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'IdeationNext'
>;

export function IdeationNext() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const bookDoctor = () => {
    navigation.navigate('DoctorList');
  };

  const viewNearbyLabs = () => {
    // No lab-schedule screen exists yet.
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

        <Text style={styles.heading}>{IDEATION_NEXT_HEADING}</Text>

        <View style={styles.bannerWrapper}>
          <TelemedicinePromoBanner
            badge={TELEMEDICINE_PROMO.badge}
            caption={TELEMEDICINE_PROMO.caption}
            image={TELEMEDICINE_PROMO.image}
            onPress={bookDoctor}
          />
        </View>

        <View style={styles.adviceList}>
          <AdviceCard
            iconName="leaf"
            title={SELF_CARE_TIPS.title}
            bullets={SELF_CARE_TIPS.bullets}
          />
          <AdviceCard
            iconName="stethoscope"
            title={OTC_SUGGESTIONS.title}
            body={OTC_SUGGESTIONS.body}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaWrapper,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <GradientPillButton label={BOOK_DOCTOR_LABEL} onPress={bookDoctor} />
        <SecondaryPillButton
          label={NEARBY_LABS_LABEL}
          onPress={viewNearbyLabs}
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
  bannerWrapper: {
    marginTop: 20,
  },
  adviceList: {
    marginTop: 14,
    gap: 12,
  },
  ctaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
});
