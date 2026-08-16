import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {authApi} from '../../api/auth';
import {profileApi, type EmergencyContact} from '../../api/profile';
import {uploadAvatarAsset} from '../../api/uploads';
import {imageUri} from '../../utils/fileAsset';
import {API_ORIGIN} from '../../config/api';
import {ApiError} from '../../api/client';
import {useFocusEffect} from '@react-navigation/native';
import {AddEmergencyContactModal} from '../../components/AddEmergencyContactModal';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const PROFILE_AVATAR = require('../../assets/b1.png');

export function EditProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [bloodPressure, setBloodPressure] = useState('');
  const [oxygen, setOxygen] = useState('');
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [savingEmergency, setSavingEmergency] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await profileApi.overview();
      const user = overview.user;
      const patient = user.patientProfile;
      setName(user.fullName ?? '');
      setAge(patient?.age != null ? String(patient.age) : '');
      setGender(patient?.gender ?? '');
      setBloodGroup(patient?.bloodGroup ?? '');
      setAddress(overview.defaultAddress?.formattedAddress ?? '');
      setPhone(user.phone ?? '');
      setEmail(user.email ?? '');
      setAvatarUrl(user.avatarUrl ?? null);
      setEmergencyContacts(patient?.emergencyContacts ?? []);
      setBloodPressure(overview.healthVitals?.bloodPressure?.value ?? '');
      setOxygen(overview.healthVitals?.oxygen?.value?.replace(/%$/, '') ?? '');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load profile';
      Alert.alert('Edit profile', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

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

  const pickPhoto = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1});
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    setUploadingPhoto(true);
    try {
      const uploaded = await uploadAvatarAsset(asset);
      setAvatarUrl(uploaded.fileUrl);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not upload photo';
      Alert.alert('Upload photo', message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveEmergencyContact = async (payload: {
    name: string;
    relation: string;
    phone: string;
  }) => {
    setSavingEmergency(true);
    try {
      await profileApi.addEmergencyContact(payload);
      setEmergencyModalVisible(false);
      await loadProfile();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not add emergency contact';
      Alert.alert('Emergency contact', message);
    } finally {
      setSavingEmergency(false);
    }
  };

  const removeEmergencyContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Remove contact',
      `Remove ${contact.name} from emergency contacts?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.removeEmergencyContact(contact.id);
              await loadProfile();
            } catch (err) {
              const message =
                err instanceof ApiError ? err.message : 'Could not remove contact';
              Alert.alert('Emergency contact', message);
            }
          },
        },
      ],
    );
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await authApi.updateMe({
        fullName: name.trim() || undefined,
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      });
      await profileApi.updatePatient({
        age: age ? Number(age) : undefined,
        gender: gender.trim() || undefined,
        bloodGroup: bloodGroup.trim() || undefined,
      });
      const bp = bloodPressure.trim();
      const o2 = oxygen.trim();
      if (bp || o2) {
        await profileApi.updateVitals({
          bloodPressure: bp || undefined,
          oxygen: o2 || undefined,
        });
      }
      navigation.goBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save profile';
      Alert.alert('Edit profile', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                avatarUrl
                  ? {uri: imageUri(avatarUrl, API_ORIGIN)}
                  : PROFILE_AVATAR
              }
              style={styles.profileAvatar}
            />
            <TouchableOpacity
              style={styles.avatarCameraBadge}
              activeOpacity={0.8}
              onPress={pickPhoto}
              disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#0D9488" />
              ) : (
                <Feather name="camera" size={14} color="#0D9488" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <FormField label="Name" value={name} onChangeText={setName} />
          <FormField
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <FormField label="Gender" value={gender} onChangeText={setGender} />
          <FormField
            label="Blood Group"
            value={bloodGroup}
            onChangeText={setBloodGroup}
          />
          <FormField label="Location" value={address} onChangeText={setAddress} />
          <FormField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.blockSectionHeading}>Health Vitals</Text>
        <View style={styles.formSection}>
          <FormField
            label="Blood Pressure"
            value={bloodPressure}
            onChangeText={setBloodPressure}
            keyboardType="numbers-and-punctuation"
            placeholder="e.g. 120/80"
          />
          <View>
            <Text style={styles.inputFieldLabel}>Oxygen Level (%)</Text>
            <TextInput
              style={styles.textInputBox}
              value={oxygen}
              onChangeText={setOxygen}
              placeholder="e.g. 98"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <Text style={styles.blockSectionHeading}>Emergency Contact</Text>

        <View style={styles.emergencyCardListBlock}>
          {emergencyContacts.map((contact, index) => (
            <View
              key={contact.id}
              style={[
                styles.emergencyCardRow,
                index === emergencyContacts.length - 1 &&
                  styles.emergencyCardRowLast,
              ]}>
              <View style={styles.contactAvatarPlaceholder}>
                <Text style={styles.contactAvatarInitial}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactTextMeta}>
                <Text style={styles.contactNameTitle}>{contact.name}</Text>
                <Text style={styles.contactRelationLabel}>
                  {contact.relation}
                </Text>
                <Text style={styles.contactPhoneText}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeContactIconButton}
                activeOpacity={0.8}
                onPress={() => removeEmergencyContact(contact)}>
                <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addNewContactLinkRow}
            activeOpacity={0.8}
            onPress={() => setEmergencyModalVisible(true)}>
            <Feather
              name="plus"
              size={16}
              color="#14B8A6"
              style={styles.plusIconMargin}
            />
            <Text style={styles.addNewContactLinkText}>
              Add New Emergency Contact
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveProfileButton}
          activeOpacity={0.9}
          disabled={saving}
          onPress={saveProfile}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveProfileButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="profile"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>

      <AddEmergencyContactModal
        visible={emergencyModalVisible}
        saving={savingEmergency}
        onClose={() => setEmergencyModalVisible(false)}
        onSave={saveEmergencyContact}
      />
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'sentences';
  placeholder?: string;
}) {
  return (
    <View>
      <Text style={styles.inputFieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInputBox}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#CBD5E1',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E6F4F1',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  inputFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: '#1E293B',
  },
  blockSectionHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 24,
    marginBottom: 12,
  },
  emergencyCardListBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  emergencyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  emergencyCardRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  contactAvatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
  },
  contactAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  contactTextMeta: {
    marginLeft: 12,
    flex: 1,
  },
  contactNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  contactRelationLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  contactPhoneText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  removeContactIconButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  addNewContactLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 4,
    marginTop: 4,
  },
  plusIconMargin: {
    marginRight: 4,
  },
  addNewContactLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
  },
  saveProfileButton: {
    backgroundColor: '#408E91',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#408E91',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
