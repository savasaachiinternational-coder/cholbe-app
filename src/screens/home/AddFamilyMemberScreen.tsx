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
import {useFocusEffect} from '@react-navigation/native';
import {profileApi} from '../../api/profile';
import {uploadAvatarAsset} from '../../api/uploads';
import {imageUri} from '../../utils/fileAsset';
import {API_ORIGIN} from '../../config/api';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFamilyMember'>;

type GenderOption = 'Male' | 'Female' | 'Other';

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Other'];

export function AddFamilyMemberScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<GenderOption>('Male');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      profileApi.overview().then(data => {
        if (data.isFamilyDependent) {
          Alert.alert(
            'Not available',
            'Family accounts cannot add other members. Ask your parent account holder.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
      }).catch(() => {});
    }, [navigation]),
  );

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

  const saveMember = async () => {
    if (!name.trim() || !relationship.trim()) {
      Alert.alert('Family member', 'Name and relationship are required.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Family member', 'Email or phone is required for login.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Family member', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Family member', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await profileApi.addFamilyMember({
        name: name.trim(),
        relationship: relationship.trim(),
        gender,
        age: age ? Number(age) : undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        password,
        avatarUrl: avatarUrl ?? undefined,
      });
      Alert.alert(
        'Family member added',
        'They can now sign in with their email or phone and password.',
      );
     navigation.canGoBack() ? navigation.goBack() : null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save member';
      Alert.alert('Family member', message);
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.headerTitle}>Add Family Member</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.uploadPhotoDashedCard}
          activeOpacity={0.85}
          onPress={pickPhoto}
          disabled={uploadingPhoto}>
          {avatarUrl ? (
            <Image
              source={{uri: imageUri(avatarUrl, API_ORIGIN)}}
              style={styles.uploadedAvatar}
            />
          ) : (
            <View style={styles.cameraIconContainer}>
              {uploadingPhoto ? (
                <ActivityIndicator color="#0D9488" size={'large'}/>
              ) : (
                <Feather name="camera" size={22} color="#0D9488" />
              )}
            </View>
          )}
          <Text style={styles.uploadPhotoHeadingText}>Upload Photo</Text>
          <Text style={styles.uploadPhotoSubtext}>Up to 5MB</Text>
        </TouchableOpacity>

        <View style={styles.formCardBlock}>
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter member's name"
          />
          <FormField
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="Enter member's age"
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabelText}>Gender</Text>
          <View style={styles.radioGroupRowContainer}>
            {GENDER_OPTIONS.map(option => {
              const active = gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.radioButtonNode,
                    active && styles.radioActiveButtonNode,
                    option !== 'Male' && styles.radioButtonSpacing,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setGender(option)}>
                  <View
                    style={[
                      styles.radioOuterCircle,
                      active && styles.radioActiveOuterCircle,
                    ]}>
                    {active ? <View style={styles.radioInnerDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.radioLabelText,
                      active && styles.radioActiveLabelText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FormField
            label="Relationship"
            value={relationship}
            onChangeText={setRelationship}
            placeholder="e.g. Son, Daughter, Mother"
          />
          <FormField
            label="Email (for login)"
            value={email}
            onChangeText={setEmail}
            placeholder="member@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Login with phone if no email"
            keyboardType="phone-pad"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            secureTextEntry
          />
          <FormField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
          />
        </View>

        <Text style={styles.loginHintText}>
          This creates a separate customer account. The family member can sign in and use their
          own profile. You will still see their details here.
        </Text>

        <TouchableOpacity
          style={styles.saveMemberPrimaryButton}
          activeOpacity={0.9}
          onPress={saveMember}>
          <Text style={styles.saveMemberPrimaryButtonText}>Save Family Member</Text>
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
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View>
      <Text style={styles.fieldLabelText}>{label}</Text>
      <TextInput
        style={styles.textInputContainer}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
  uploadPhotoDashedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  cameraIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadPhotoHeadingText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  uploadPhotoSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 2,
  },
  uploadedAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  formCardBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  fieldLabelText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: '#1E293B',
  },
  radioGroupRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButtonNode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 46,
  },
  radioButtonSpacing: {
    marginLeft: 8,
  },
  radioActiveButtonNode: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  radioOuterCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioActiveOuterCircle: {
    borderColor: '#0D9488',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
  },
  radioLabelText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#475569',
    flexShrink: 1,
  },
  radioActiveLabelText: {
    color: '#0D9488',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  saveMemberPrimaryButton: {
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
  saveMemberPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  loginHintText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
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
