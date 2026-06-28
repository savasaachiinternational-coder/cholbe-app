import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {launchImageLibrary} from 'react-native-image-picker';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {useVoiceRecorder} from '../../hooks/useVoiceRecorder';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {consultationsApi, type ConsultationMessage} from '../../api/consultations';
import {appointmentsApi} from '../../api/appointments';
import {uploadFile} from '../../api/uploads';
import {ApiError} from '../../api/client';
import {API_ORIGIN} from '../../config/api';
import {
  imageUri,
  pickedFileFromAsset,
  resolveAttachmentKind,
} from '../../utils/fileAsset';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsultationChat'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');
const CHAT_AVATAR = require('../../assets/b1.png');
const POLL_MS = 5000;

const QUICK_EMOJIS = [
  '😀', '😊', '🙂', '😂', '😍', '🥰', '😢', '😮',
  '👍', '👎', '🙏', '💪', '❤️', '💊', '🏥', '✅',
];

function attachmentTypeFromMime(mimeType: string) {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  return 'image';
}

export function ConsultationChatScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [appointmentId, setAppointmentId] = useState<string | undefined>(
    route.params?.appointmentId,
  );
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [doctorOnline, setDoctorOnline] = useState(false);
  const [doctorAvatarUrl, setDoctorAvatarUrl] = useState<string | null>(null);
  const [sharedReport, setSharedReport] = useState<{
    title: string;
    provider: string | null;
    reportDate: string;
  } | null>(null);
  const {recording, recordLabel, start: startRecording, stop: stopRecording} =
    useVoiceRecorder();

  const doctorName = route.params?.doctorName ?? 'Book a doctor';
  const specialty = route.params?.specialty ?? 'Video consultation';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (route.params?.appointmentId) {
        setAppointmentId(route.params.appointmentId);
        return;
      }
      try {
        if (route.params?.doctorId) {
          const appt = await consultationsApi.activeAppointment(route.params.doctorId);
          if (!cancelled && appt?.id) {
            setAppointmentId(appt.id);
            return;
          }
        }
        const list = await appointmentsApi.list();
        if (!cancelled) {
          const active = list.find(
            a => !['cancelled', 'CANCELLED', 'no_show', 'NO_SHOW'].includes(a.status),
          );
          if (active) setAppointmentId(active.id);
        }
      } catch {
        // Resolved on next focus or user books an appointment.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params?.appointmentId, route.params?.doctorId]);

  const loadChat = useCallback(async () => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [context, list] = await Promise.all([
        consultationsApi.context(appointmentId),
        consultationsApi.listMessages(appointmentId),
      ]);
      setSharedReport(context.sharedReport);
      setMessages(list);
      setDoctorOnline(context.appointment.doctor.isOnline);
      setDoctorAvatarUrl(context.appointment.doctor.user.avatarUrl);
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Could not load chat';
      Alert.alert('Chat', text);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      loadChat();
    }, [loadChat]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!appointmentId) return;
      let cancelled = false;

      const poll = async () => {
        try {
          const [context, list] = await Promise.all([
            consultationsApi.context(appointmentId),
            consultationsApi.listMessages(appointmentId),
          ]);
          if (cancelled) return;
          setDoctorOnline(context.appointment.doctor.isOnline);
          setDoctorAvatarUrl(context.appointment.doctor.user.avatarUrl);
          setSharedReport(context.sharedReport);
          setMessages(list);
        } catch {
          // Ignore transient poll errors.
        }
      };

      const timer = setInterval(poll, POLL_MS);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }, [appointmentId]),
  );

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollToEnd({animated: true});
    }
  }, [messages.length]);

  const requireAppointment = () => {
    Alert.alert(
      'Chat unavailable',
      'Please book a consultation with this doctor before sending messages.',
    );
  };

  const sendMessage = async (payload?: {
    content: string;
    attachmentUrl?: string;
    attachmentType?: string;
  }) => {
    const text = (payload?.content ?? message).trim();
    const hasAttachment = Boolean(payload?.attachmentUrl);
    if ((!text && !hasAttachment) || !appointmentId) {
      if (!appointmentId) requireAppointment();
      return;
    }
    setSending(true);
    try {
      const created = await consultationsApi.sendMessage(appointmentId, {
        content: text || (hasAttachment ? 'Attachment' : ''),
        attachmentUrl: payload?.attachmentUrl,
        attachmentType: payload?.attachmentType,
      });
      setMessages(prev => [...prev, created]);
      if (!payload) setMessage('');
    } catch (err) {
      const textErr = err instanceof ApiError ? err.message : 'Could not send message';
      Alert.alert('Chat', textErr);
    } finally {
      setSending(false);
    }
  };

  const uploadAndSendAttachment = async (
    uri: string,
    fileName: string,
    mimeType: string,
  ) => {
    if (!appointmentId) {
      requireAppointment();
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadFile(
        '/uploads/chat-attachment',
        uri,
        fileName,
        mimeType,
      );
      const caption = message.trim();
      const created = await consultationsApi.sendMessage(appointmentId, {
        content: caption || uploaded.fileName || 'Shared file',
        attachmentUrl: uploaded.fileUrl,
        attachmentType: attachmentTypeFromMime(uploaded.mimeType),
      });
      setMessages(prev => [...prev, created]);
      setMessage('');
      scrollRef.current?.scrollToEnd({animated: true});
    } catch (err) {
      const textErr = err instanceof ApiError ? err.message : 'Could not upload file';
      Alert.alert('Chat', textErr);
    } finally {
      setUploading(false);
    }
  };

  const pickAttachment = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.didCancel || !result.assets?.length) return;
    const file = pickedFileFromAsset(result.assets[0], 'chat');
    if (!file) {
      Alert.alert('Chat', 'Could not read selected file');
      return;
    }
    await uploadAndSendAttachment(file.uri, file.fileName, file.mimeType);
  };

  const toggleVoiceRecording = async () => {
    if (uploading || sending) return;
    if (!recording) {
      const started = await startRecording();
      if (!started) {
        Alert.alert('Microphone', 'Microphone permission is required to record voice notes.');
      }
      return;
    }
    const uri = await stopRecording();
    if (!uri) return;
    await uploadAndSendAttachment(uri, `voice-${Date.now()}.m4a`, 'audio/m4a');
  };

  const appendEmoji = (emoji: string) => {
    setMessage(prev => `${prev}${emoji}`);
    setEmojiOpen(false);
  };

  const composerBottom = insets.bottom + 72;
  const scrollBottomPadding = composerBottom + 64 + 16;
  const busy = sending || uploading;
  const canSendText = Boolean(message.trim()) && !busy && !recording;
  const doctorAvatarSource = doctorAvatarUrl
    ? {uri: imageUri(doctorAvatarUrl, API_ORIGIN)}
    : DOCTOR_AVATAR;

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
          <Image source={doctorAvatarSource} style={styles.doctorAvatar} />
          <View style={styles.doctorMeta}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{specialty}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.onlineDot,
                  doctorOnline ? styles.onlineDotActive : styles.onlineDotOffline,
                ]}
              />
              <Text style={styles.statusText}>
                {doctorOnline ? 'Online' : 'Offline'}
              </Text>
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
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: scrollBottomPadding},
          ]}
          keyboardShouldPersistTaps="handled">
          {sharedReport ? (
            <View style={styles.attachmentCard}>
              <View style={styles.attachmentHeaderRow}>
                <View style={styles.folderIconWrapper}>
                  <Feather name="folder" size={20} color="#0D9488" />
                </View>
                <Text style={styles.attachmentTitle}>{sharedReport.title}</Text>
              </View>
              {sharedReport.provider ? (
                <Text style={styles.attachmentSource}>{sharedReport.provider}</Text>
              ) : null}
              <View style={styles.dateBadgeRow}>
                <Feather
                  name="calendar"
                  size={14}
                  color="#0D9488"
                  style={styles.dateIcon}
                />
                <Text style={styles.dateBadgeText}>
                  Taken:{' '}
                  {new Date(sharedReport.reportDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color="#14B8A6" style={{marginVertical: 24}} />
          ) : (
            <View style={styles.chatStreamContainer}>
              {messages.length === 0 ? (
                <Text style={styles.emptyChatText}>
                  {appointmentId
                    ? 'No messages yet. Say hello to your doctor.'
                    : 'Book a consultation to start chatting.'}
                </Text>
              ) : null}
              {messages.map(msg => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </View>
          )}
        </ScrollView>

        {recording ? (
          <View style={[styles.recordingBanner, {bottom: composerBottom + 64}]}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording {recordLabel}</Text>
            <Text style={styles.recordingHint}>Tap mic to send</Text>
          </View>
        ) : null}

        <View style={[styles.chatComposerPanel, {bottom: composerBottom}]}>
          <TouchableOpacity
            style={styles.composerIconButton}
            activeOpacity={0.7}
            onPress={pickAttachment}
            disabled={busy}>
            <Feather
              name="paperclip"
              size={22}
              color={busy ? '#CBD5E1' : '#64748B'}
            />
          </TouchableOpacity>

          <View style={styles.inputInnerRowContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.emojiButton}
              onPress={() => setEmojiOpen(true)}
              disabled={busy}>
              <Feather name="smile" size={22} color={busy ? '#CBD5E1' : '#14B8A6'} />
            </TouchableOpacity>
            <TextInput
              placeholder="Chat Publicly"
              placeholderTextColor="#94A3B8"
              style={styles.textComposerInput}
              value={message}
              onChangeText={setMessage}
              editable={!busy}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleVoiceRecording}
              disabled={uploading || sending}>
              <Feather
                name="mic"
                size={22}
                color={recording ? '#EF4444' : busy ? '#CBD5E1' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendActionButton,
              !canSendText && styles.sendActionButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={() => sendMessage()}
            disabled={!canSendText}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={emojiOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEmojiOpen(false)}>
        <Pressable style={styles.emojiBackdrop} onPress={() => setEmojiOpen(false)}>
          <View style={[styles.emojiPanel, {bottom: composerBottom + 72}]}>
            <View style={styles.emojiGrid}>
              {QUICK_EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiCell}
                  onPress={() => appendEmoji(emoji)}>
                  <Text style={styles.emojiChar}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

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

function ChatBubble({message}: {message: ConsultationMessage}) {
  const incoming = message.sender.role === 'DOCTOR';
  const [imageFailed, setImageFailed] = useState(false);
  const timestamp = new Date(message.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const attachmentUrl = message.attachmentUrl
    ? imageUri(message.attachmentUrl, API_ORIGIN)
    : null;
  const attachmentKind = resolveAttachmentKind(
    message.attachmentType,
    message.attachmentUrl,
  );
  const showImage = attachmentKind === 'image' && attachmentUrl && !imageFailed;
  const showPdf = attachmentKind === 'pdf' && attachmentUrl;
  const showAudio = attachmentKind === 'audio' && attachmentUrl;
  const showGenericFile = attachmentKind === 'file' && attachmentUrl;
  const hasVisibleText =
    Boolean(message.content?.trim()) &&
    message.content.trim() !== 'Attachment' &&
    message.content.trim() !== 'Shared file';

  const openAttachment = () => {
    if (attachmentUrl) void Linking.openURL(attachmentUrl);
  };

  const fileLabel =
    message.content?.trim() && message.content.trim() !== 'Shared file'
      ? message.content.trim()
      : message.attachmentUrl?.split('/').pop() ?? 'File';

  const body = (
    <>
      {hasVisibleText ? (
        <Text style={incoming ? styles.incomingMessageText : styles.outgoingMessageText}>
          {message.content}
        </Text>
      ) : null}
      {showImage ? (
        <TouchableOpacity onPress={openAttachment} activeOpacity={0.9}>
          <Image
            source={{uri: attachmentUrl!}}
            style={styles.chatAttachmentImage}
            onError={() => setImageFailed(true)}
          />
        </TouchableOpacity>
      ) : null}
      {imageFailed && attachmentUrl ? (
        <TouchableOpacity style={styles.chatFileRow} onPress={openAttachment}>
          <Feather name="image" size={18} color="#0D9488" />
          <Text style={styles.chatFileLabel}>Image attachment</Text>
        </TouchableOpacity>
      ) : null}
      {showPdf ? (
        <TouchableOpacity style={styles.chatFileRow} onPress={openAttachment}>
          <Feather name="file-text" size={18} color="#0D9488" />
          <Text style={styles.chatFileLabel}>PDF attachment</Text>
        </TouchableOpacity>
      ) : null}
      {showAudio ? (
        <TouchableOpacity style={styles.chatFileRow} onPress={openAttachment}>
          <Feather name="volume-2" size={18} color="#0D9488" />
          <Text style={styles.chatFileLabel}>Voice message</Text>
        </TouchableOpacity>
      ) : null}
      {showGenericFile ? (
        <TouchableOpacity style={styles.chatFileRow} onPress={openAttachment}>
          <Feather name="paperclip" size={18} color="#0D9488" />
          <Text style={styles.chatFileLabel}>{fileLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  if (incoming) {
    return (
      <View style={styles.incomingMessageWrapper}>
        <Image source={CHAT_AVATAR} style={styles.chatUserAvatar} />
        <View style={styles.incomingBubbleContainer}>
          <View style={styles.incomingMessageBubble}>{body}</View>
          <Text style={styles.timestampLeft}>{timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outgoingMessageWrapper}>
      <View style={styles.outgoingBubbleContainer}>
        <View style={styles.outgoingMessageBubble}>{body}</View>
        <Text style={styles.timestampRight}>{timestamp}</Text>
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
    marginRight: 4,
  },
  onlineDotActive: {
    backgroundColor: '#22C55E',
  },
  onlineDotOffline: {
    backgroundColor: '#94A3B8',
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
  emptyChatText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
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
  chatAttachmentImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#E2E8F0',
  },
  chatFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  chatFileLabel: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
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
  sendActionButtonDisabled: {
    opacity: 0.55,
  },
  recordingBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    zIndex: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C',
  },
  recordingHint: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  emojiBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  emojiPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiCell: {
    width: '12.5%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  emojiChar: {
    fontSize: 24,
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
