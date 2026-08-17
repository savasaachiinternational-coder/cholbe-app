import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {useEdgeToEdgeStatusBar} from '../../../hooks/useEdgeToEdgeStatusBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {AiHelpCategoryCard} from '../components/AiHelpCategoryCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

const CATEGORIES = [
  {iconName: 'thermometer', title: 'Fever'},
  {iconName: 'sleep', title: 'Fatigue'},
  {iconName: 'lungs', title: 'Shortness of Breath'},
  {iconName: 'allergy', title: 'Skin Rash'},
  {iconName: 'emoticon-sick-outline', title: 'Nausea'},
  {iconName: 'human-handsup', title: 'Skin Rash'},
];
type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function AiSymptomHome() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.marginatedContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={[styles.headerCard, {marginTop: insets.top + 12}]}>
          <Image
            source={require('../../../assets/syaiicon.png')}
            style={styles.aiIcon}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.cardTitle}>ideated AI</Text>
            <Text style={styles.cardSubtitle}>
              Describe feel, AI will guide you step-by-step
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={10}
            onPress={() => {}}
            style={styles.closeButton}>
            <Feather name="x" color="#5F6B76" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>Hi! Rahman Uddin</Text>
          <Text style={styles.greetingSubtitle}>
            I'm your smart assistant. Ready when you are.
          </Text>
        </View>

        <View style={styles.helpCardContainer}>
          {CATEGORIES.map((item, index) => (
            <AiHelpCategoryCard
              key={`${item.title}-${index}`}
              iconName={item.iconName}
              title={item.title}
              onPress={() => setMessage(item.title)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.inputBoxWrapper,
          {paddingBottom: Math.max(insets.bottom, 12)},
        ]}>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. Headache, stomach pain"
            placeholderTextColor="#8A939C"
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputActions}>
            <TouchableOpacity activeOpacity={0.8} hitSlop={8} onPress={() => {}}>
              <Feather name="plus" color="#454F5B" size={22} />
            </TouchableOpacity>
            <View style={styles.inputActionsRight}>
              <TouchableOpacity
                activeOpacity={0.8}
                hitSlop={8}
                onPress={() => {}}>
                <Feather name="mic" color="#454F5B" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {}}
                style={styles.sendButton}>
                <Feather name="send" color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height:90,
    width: '100%',
    gap: 10,
    padding: 12,
    backgroundColor: '#EDF8F5',
    borderRadius: 14,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 1,
  },
  aiIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  headerTextContainer: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  cardTitle: {
    color: '#091B27',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    marginTop: 2,
    color: '#454F5B',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
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
  helpCardContainer: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  inputBoxWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputBox: {
    height: 132,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDDD4',
    borderRadius: 12,
    backgroundColor: '#F1F9F6',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    padding: 0,
    color: '#091B27',
    fontSize: 13,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sendButton: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BAE8C',
  },
});