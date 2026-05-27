import {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {CHAT_MESSAGES, type ChatMessage} from './consultationChatData';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsultationChat'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');
const CHAT_AVATAR = require('../../assets/b1.png');

export function ConsultationChatScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const doctorName = route.params?.doctorName ?? 'Dr. Ahmed';
  const specialty = route.params?.specialty ?? 'Cardiologist';

  const composerBottom = insets.bottom + 72;
  const scrollBottomPadding = composerBottom + 64 + 16;

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
      return;
    }
    if (tab === 'medication') {
      navigation.navigate('MedicineList');
      return;
    }
    if (tab === 'report') {
      navigation.navigate('ReportsList');
      return;
    }
    if (tab === 'profile') {
      navigation.navigate('MyProfile');
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.doctorHeaderProfile}>
          <Image source={DOCTOR_AVATAR} style={styles.doctorAvatar} />
          <View style={styles.doctorMeta}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{specialty}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: scrollBottomPadding},
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.attachmentCard}>
            <View style={styles.attachmentHeaderRow}>
              <View style={styles.folderIconWrapper}>
                <Feather name="folder" size={20} color="#0D9488" />
              </View>
              <Text style={styles.attachmentTitle}>Blood Test Results</Text>
            </View>
            <Text style={styles.attachmentSource}>Devcare Lab, Dhaka</Text>
            <View style={styles.dateBadgeRow}>
              <Feather
                name="calendar"
                size={14}
                color="#0D9488"
                style={styles.dateIcon}
              />
              <Text style={styles.dateBadgeText}>Taken: Monday,12 Feb</Text>
            </View>
          </View>

          <View style={styles.chatStreamContainer}>
            {CHAT_MESSAGES.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.chatComposerPanel, {bottom: composerBottom}]}>
          <TouchableOpacity style={styles.composerIconButton} activeOpacity={0.7}>
            <Feather
              name="link-2"
              size={22}
              color="#64748B"
              style={styles.linkIconRotation}
            />
          </TouchableOpacity>

          <View style={styles.inputInnerRowContainer}>
            <TouchableOpacity activeOpacity={0.7} style={styles.emojiButton}>
              <Feather name="smile" size={22} color="#14B8A6" />
            </TouchableOpacity>
            <TextInput
              placeholder="Chat Publicly"
              placeholderTextColor="#94A3B8"
              style={styles.textComposerInput}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="mic" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendActionButton} activeOpacity={0.85}>
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: composerBottom + 72}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="home"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function ChatBubble({message}: {message: ChatMessage}) {
  if (message.type === 'incoming') {
    return (
      <View style={styles.incomingMessageWrapper}>
        <Image source={CHAT_AVATAR} style={styles.chatUserAvatar} />
        <View style={styles.incomingBubbleContainer}>
          <View style={styles.incomingMessageBubble}>
            <Text style={styles.incomingMessageText}>{message.text}</Text>
          </View>
          <Text style={styles.timestampLeft}>{message.timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outgoingMessageWrapper}>
      <View style={styles.outgoingBubbleContainer}>
        <View style={styles.outgoingMessageBubble}>
          <Text style={styles.outgoingMessageText}>{message.text}</Text>
        </View>
        <Text style={styles.timestampRight}>{message.timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  doctorHeaderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    flex: 1,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  doctorMeta: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  attachmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  attachmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  folderIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  attachmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  attachmentSource: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 42,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 42,
  },
  dateIcon: {
    marginRight: 6,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  chatStreamContainer: {
    marginTop: 24,
  },
  incomingMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '85%',
    marginBottom: 16,
  },
  chatUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  incomingBubbleContainer: {
    marginLeft: 10,
    flex: 1,
  },
  incomingMessageBubble: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  incomingMessageText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  timestampLeft: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  outgoingMessageWrapper: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 16,
  },
  outgoingBubbleContainer: {
    width: '85%',
  },
  outgoingMessageBubble: {
    backgroundColor: '#EDE7F6',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 14,
  },
  outgoingMessageText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  timestampRight: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatComposerPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#F5F6FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  composerIconButton: {
    padding: 4,
  },
  linkIconRotation: {
    transform: [{rotate: '45deg'}],
  },
  inputInnerRowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emojiButton: {
    marginRight: 6,
  },
  textComposerInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  sendActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#408E91',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
