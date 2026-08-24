import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {vendorApi, type VendorDocument, type VendorPayoutMethod} from '../../api/vendor';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';
import {uploadFile} from '../../api/uploads';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {
  FALLBACK_BANNER,
  resolveImageSource,
} from '../../utils/imageFallbacks';
import {AvatarImage} from '../../components/AvatarImage';
import {VendorBottomNav} from './VendorBottomNav';
import {performLogout} from '../../auth/sessionControl';
import {confirmAndDeleteAccount} from '../../auth/deleteAccount';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'VProfile'>;

// Figma "Card/Shadow 1": 0 4px 60px 0 rgba(4, 6, 15, 0.08).
const CARD_SHADOW = {
  shadowColor: '#04060F',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.08,
  shadowRadius: 30,
  elevation: 2,
} as const;
type ExpandedSection = 'store' | 'wallet' | 'vault' | null;

type VendorProfile = {
  id: string;
  pharmacyName: string;
  phone?: string | null;
  address?: string | null;
  isStoreOpen: boolean;
  bannerUrl?: string | null;
  approvalStatus?: string;
  user?: {fullName: string; phone?: string | null};
};

function SectionHeader({title}: {title: string}) {
  return <Text style={styles.groupSectionTitle}>{title}</Text>;
}

type SettingRowProps = {
  icon: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  onPress: () => void;
};

function SettingRow({icon, title, subtitle, expanded, onPress}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingRowHeaderLink, !expanded && styles.settingRowHeaderLinkCollapsed]}
      activeOpacity={0.7}
      onPress={onPress}>
      <View style={styles.settingIconLabelGroup}>
        <View style={styles.settingIconBackground}>
          <Feather name={icon} size={16} color="#4E929D" />
        </View>
        <View style={styles.settingTextBlock}>
          <Text style={styles.settingRowMainTitle}>{title}</Text>
          <Text style={styles.settingRowSubTitle}>{subtitle}</Text>
        </View>
      </View>
      <Feather
        name={expanded ? 'chevron-down' : 'chevron-right'}
        size={16}
        color="#7E8B97"
      />
    </TouchableOpacity>
  );
}

type VendorEditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  pharmacyName: string;
  onPharmacyNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  address: string;
  onAddressChange: (v: string) => void;
  bannerUrl: string;
  onBannerUrlChange: (v: string) => void;
  saving: boolean;
  onSave: () => void;
};

function VendorEditProfileModal({
  visible,
  onClose,
  pharmacyName,
  onPharmacyNameChange,
  phone,
  onPhoneChange,
  address,
  onAddressChange,
  bannerUrl,
  onBannerUrlChange,
  saving,
  onSave,
}: VendorEditProfileModalProps) {
  const handlePickBanner = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, async response => {
      if (response.didCancel || !response.assets?.length) return;
      const asset = response.assets[0];
      if (!asset.uri || !asset.fileName || !asset.type) return;
      try {
        const result = await uploadFile(
          '/uploads/product-image',
          asset.uri,
          asset.fileName,
          asset.type,
        );
        onBannerUrlChange(result.fileUrl);
      } catch {
        Alert.alert('Error', 'Could not upload banner image');
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.epOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.epModal}>
          <View style={styles.epHeader}>
            <Text style={styles.epTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>

          <View style={styles.epField}>
            <Text style={styles.epLabel}>Pharmacy Name</Text>
            <TextInput
              style={styles.epInput}
              placeholder="Enter pharmacy name"
              placeholderTextColor="#9AA6B2"
              value={pharmacyName}
              onChangeText={onPharmacyNameChange}
            />
          </View>

          <View style={styles.epField}>
            <Text style={styles.epLabel}>Phone</Text>
            <TextInput
              style={styles.epInput}
              placeholder="Enter phone number"
              placeholderTextColor="#9AA6B2"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={onPhoneChange}
            />
          </View>

          <View style={styles.epField}>
            <Text style={styles.epLabel}>Address</Text>
            <TextInput
              style={[styles.epInput, styles.epInputMultiline]}
              placeholder="Enter address"
              placeholderTextColor="#9AA6B2"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={onAddressChange}
            />
          </View>

          <TouchableOpacity
            style={styles.epBannerBtn}
            onPress={handlePickBanner}
            activeOpacity={0.8}>
            <Feather name="image" size={16} color="#4E929D" />
            <Text style={styles.epBannerBtnText}>
              {bannerUrl ? 'Change Banner Image' : 'Add Banner Image'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.epSaveBtn, saving && styles.epSaveBtnDisabled]}
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.epSaveBtnText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function VendorChangePasswordModal({visible, onClose}: {visible: boolean; onClose: () => void}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Password', 'All fields are required.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Password', 'New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Password', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      Alert.alert('Success', 'Password changed successfully.');
      setCurrent('');
      setNext('');
      setConfirm('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.cpOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.cpModal}>
          <View style={styles.cpHeader}>
            <Text style={styles.cpTitle}>Change Password</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>
          {['Current Password', 'New Password', 'Confirm Password'].map((label, idx) => (
            <View key={label} style={styles.cpField}>
              <Text style={styles.cpLabel}>{label}</Text>
              <TextInput
                style={styles.cpInput}
                placeholder="••••••••"
                placeholderTextColor="#9AA6B2"
                secureTextEntry
                value={idx === 0 ? current : idx === 1 ? next : confirm}
                onChangeText={idx === 0 ? setCurrent : idx === 1 ? setNext : setConfirm}
              />
            </View>
          ))}
          <TouchableOpacity
            style={[styles.cpSaveBtn, saving && styles.cpSaveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.cpSaveBtnText}>Save Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function VendorPharmacyProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editPharmacyName, setEditPharmacyName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [storeEditMode, setStoreEditMode] = useState(false);
  const [opPharmacyName, setOpPharmacyName] = useState('');
  const [opPhone, setOpPhone] = useState('');
  const [opAddress, setOpAddress] = useState('');
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<VendorPayoutMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [nextPayoutLabel, setNextPayoutLabel] = useState('');
  const [rating, setRating] = useState(4.8);
  const [acceptanceRate, setAcceptanceRate] = useState(98);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutEdit, setPayoutEdit] = useState<VendorPayoutMethod | null>(null);
  const [payoutLabel, setPayoutLabel] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutType, setPayoutType] = useState<'BANK' | 'BKASH' | 'NAGAD'>('BANK');
  const [payoutSaving, setPayoutSaving] = useState(false);

  const syncOperationalFields = useCallback((profile: VendorProfile) => {
    setOpPharmacyName(profile.pharmacyName ?? '');
    setOpPhone(profile.phone ?? profile.user?.phone ?? '');
    setOpAddress(profile.address ?? '');
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorApi.dashboard();
      setVendor(data.vendor);
      setIsStoreOpen(data.vendor.isStoreOpen);
      syncOperationalFields(data.vendor);
      setDocuments(data.documents ?? []);
      setPayoutMethods(data.payoutMethods ?? []);
      setWalletBalance(Number(data.wallet?.availableBalance ?? 0));
      setNextPayoutLabel(data.wallet?.nextPayoutLabel ?? '');
      setRating(Number(data.metrics?.rating ?? 4.8));
      setAcceptanceRate(Number(data.metrics?.acceptanceRate ?? 98));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load profile';
      Alert.alert('Profile', message);
    } finally {
      setLoading(false);
    }
  }, [syncOperationalFields]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const saveProfile = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await vendorApi.updateProfile({
        isStoreOpen,
        pharmacyName: opPharmacyName.trim() || undefined,
        phone: opPhone.trim() || undefined,
        address: opAddress.trim() || undefined,
      });
      setVendor(updated as VendorProfile);
      syncOperationalFields(updated as VendorProfile);
      setStoreEditMode(false);
      Alert.alert('Profile', 'Changes saved successfully.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save profile';
      Alert.alert('Profile', message);
    } finally {
      setSaving(false);
    }
  }, [isStoreOpen, opPharmacyName, opPhone, opAddress, syncOperationalFields]);

  const handleUploadDocument = () => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 1}, async response => {
      if (response.didCancel || !response.assets?.length) return;
      const asset = response.assets[0];
      if (!asset.uri || !asset.fileName || !asset.type) return;
      setUploadingDoc(true);
      try {
        const uploaded = await uploadFile(
          '/uploads/vendor-document',
          asset.uri,
          asset.fileName,
          asset.type,
        );
        await vendorApi.addDocument({
          fileName: uploaded.fileName,
          fileUrl: uploaded.fileUrl,
          mimeType: uploaded.mimeType,
        });
        await loadProfile();
        Alert.alert('Document', 'Document uploaded successfully.');
      } catch (err) {
        Alert.alert(
          'Upload failed',
          err instanceof ApiError ? err.message : 'Could not upload document',
        );
      } finally {
        setUploadingDoc(false);
      }
    });
  };

  const handleRemoveDocument = (doc: VendorDocument) => {
    Alert.alert('Remove document', `Remove ${doc.fileName}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await vendorApi.removeDocument(doc.id);
            await loadProfile();
          } catch (err) {
            Alert.alert(
              'Error',
              err instanceof ApiError ? err.message : 'Could not remove document',
            );
          }
        },
      },
    ]);
  };

  const openPayoutEditor = (method?: VendorPayoutMethod) => {
    setPayoutEdit(method ?? null);
    setPayoutLabel(method?.label ?? '');
    setPayoutAccount(method?.accountMasked ?? '');
    setPayoutType(method?.methodType ?? 'BANK');
    setPayoutModalVisible(true);
  };

  const savePayoutMethod = async () => {
    if (!payoutLabel.trim() || !payoutAccount.trim()) {
      Alert.alert('Payout', 'Label and account are required.');
      return;
    }
    setPayoutSaving(true);
    try {
      await vendorApi.upsertPayoutMethod({
        id: payoutEdit?.id,
        label: payoutLabel.trim(),
        methodType: payoutType,
        accountMasked: payoutAccount.trim(),
        isPrimary: payoutEdit?.isPrimary ?? payoutMethods.length === 0,
      });
      setPayoutModalVisible(false);
      await loadProfile();
    } catch (err) {
      Alert.alert('Payout', err instanceof ApiError ? err.message : 'Could not save payout method');
    } finally {
      setPayoutSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    try {
      await vendorApi.updateProfile({
        pharmacyName: editPharmacyName.trim() || undefined,
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        bannerUrl: editBannerUrl || undefined,
      });
      Alert.alert('Profile', 'Profile updated successfully.');
      setEditVisible(false);
      loadProfile();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not update profile');
    } finally {
      setEditSaving(false);
    }
  };

  const toggleSection = (section: Exclude<ExpandedSection, null>) => {
    setExpandedSection(current => (current === section ? null : section));
  };

  const bannerSource = resolveImageSource(vendor?.bannerUrl, FALLBACK_BANNER);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Profile</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => {
            setEditPharmacyName(vendor?.pharmacyName ?? '');
            setEditPhone(vendor?.phone ?? '');
            setEditAddress(vendor?.address ?? '');
            setEditBannerUrl(vendor?.bannerUrl ?? '');
            setEditVisible(true);
          }}>
          <Feather name="edit-3" size={22} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      {loading && !vendor ? (
        <ActivityIndicator color="#4E929D" style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: 85 + insets.bottom},
          ]}>
          <View style={styles.storeMainCard}>
            <Image source={bannerSource} style={styles.storeBannerImage} />
            <View style={styles.storeTextInfoBlock}>
              <View style={styles.storeTitleRow}>
                <Text style={styles.storeNameText}>{vendor?.pharmacyName ?? '—'}</Text>
                {vendor?.approvalStatus === 'APPROVED' ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="verified" size={12} color="#47B39D" />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color="#7E8B97" />
                <Text style={styles.locationText}>{vendor?.address ?? '—'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.pharmacistCard}>
            <Text style={styles.pharmacistSectionLabel}>Licensed Pharmacist</Text>
            <View style={styles.pharmacistProfileRow}>
              <AvatarImage style={styles.pharmacistAvatar} />
              <View style={styles.pharmacistDetails}>
                <Text style={styles.pharmacistName}>{vendor?.user?.fullName ?? '—'}</Text>
                <Text style={styles.pharmacistReg}>
                  Phone: {vendor?.phone ?? vendor?.user?.phone ?? '—'}
                </Text>
              </View>
            </View>
            <View style={styles.licenseFooterRow}>
              <Text style={styles.licenseNumberText}>
                ID: {vendor?.id?.slice(0, 8).toUpperCase() ?? '—'}
              </Text>
              <Text style={styles.licenseStatusText}>
                {isStoreOpen ? 'Active' : 'Closed'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRowGroup}>
            <View style={styles.metricScoreBox}>
              <Text style={styles.metricScoreValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.metricScoreLabel}>Rating</Text>
            </View>
            <View style={styles.metricScoreBox}>
              <Text style={styles.metricScoreValue}>{acceptanceRate}%</Text>
              <Text style={styles.metricScoreLabel}>Acceptance</Text>
            </View>
          </View>

          <SectionHeader title="Store Settings" />
          <View style={styles.settingCardWrapper}>
            <SettingRow
              icon="shopping-bag"
              title="Store Settings"
              subtitle="Store Operational Control"
              expanded={expandedSection === 'store'}
              onPress={() => toggleSection('store')}
            />

            {expandedSection === 'store' ? (
              <>
                <View style={styles.storeStatusToggleRow}>
                  <View>
                    <Text style={styles.toggleRowMainText}>
                      Store Status:
                      <Text style={isStoreOpen ? styles.statusOpenText : styles.statusClosedText}>
                        {isStoreOpen ? ' Open' : ' Closed'}
                      </Text>
                    </Text>
                    <Text style={styles.toggleRowSubText}>Visible to patients</Text>
                  </View>
                  <Switch
                    value={isStoreOpen}
                    onValueChange={setIsStoreOpen}
                    trackColor={{false: '#CBD5E1', true: '#47B39D'}}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.operationalSubContainer}>
                  <View style={styles.operationalHeaderInline}>
                    <Text style={styles.operationalTitleMain}>Operational Controls</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        if (storeEditMode) {
                          syncOperationalFields(vendor!);
                        }
                        setStoreEditMode(current => !current);
                      }}>
                      <Feather name={storeEditMode ? 'x' : 'edit-2'} size={14} color="#1A1C1E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Pharmacy Name</Text>
                    {storeEditMode ? (
                      <TextInput
                        style={styles.controlInput}
                        value={opPharmacyName}
                        onChangeText={setOpPharmacyName}
                      />
                    ) : (
                      <Text style={styles.controlValueText}>{vendor?.pharmacyName ?? '—'}</Text>
                    )}
                  </View>
                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Address</Text>
                    {storeEditMode ? (
                      <TextInput
                        style={styles.controlInput}
                        value={opAddress}
                        onChangeText={setOpAddress}
                      />
                    ) : (
                      <Text style={styles.controlValueText}>{vendor?.address ?? '—'}</Text>
                    )}
                  </View>
                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Contact Phone</Text>
                    {storeEditMode ? (
                      <TextInput
                        style={styles.controlInput}
                        value={opPhone}
                        onChangeText={setOpPhone}
                        keyboardType="phone-pad"
                      />
                    ) : (
                      <Text style={styles.controlValueText}>
                        {vendor?.phone ?? vendor?.user?.phone ?? '—'}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.saveOperationsButton}
                    activeOpacity={0.9}
                    disabled={saving}
                    onPress={saveProfile}>
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.saveOperationsButtonText}>Save Operational Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>

          <SectionHeader title="Wallet & Payouts" />
          <View style={styles.settingCardWrapper}>
            <SettingRow
              icon="credit-card"
              title="Financial Payout Management"
              subtitle="A transparent and secure banking section."
              expanded={expandedSection === 'wallet'}
              onPress={() => toggleSection('wallet')}
            />

            {expandedSection === 'wallet' ? (
              <>
                <View style={styles.revenueBannerCyanCard}>
                  <Text style={styles.revenueBannerLabel}>Total Earnings Available</Text>
                  <Text style={styles.revenueBannerValue}>{formatBdt(walletBalance)}</Text>
                  <View style={styles.payoutNoticeBadge}>
                    <Text style={styles.payoutNoticeText}>
                      Next Auto-Payout: {nextPayoutLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.payoutListHeaderLabel}>Wallet & Payout</Text>

                {payoutMethods.length === 0 ? (
                  <Text style={styles.emptyListText}>No payout methods yet.</Text>
                ) : (
                  payoutMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={styles.paymentMethodItemRow}
                      activeOpacity={0.7}
                      onPress={() => openPayoutEditor(method)}>
                      {method.methodType === 'BKASH' ? (
                        <View style={styles.miniBKashIconMock}>
                          <Text style={styles.miniBrandLetter}>b</Text>
                        </View>
                      ) : (
                        <MaterialCommunityIcons name="bank-outline" size={22} color="#4E929D" />
                      )}
                      <View style={styles.paymentMethodMeta}>
                        <Text style={styles.paymentMethodTitleName}>{method.label}</Text>
                        <Text style={styles.paymentMethodMaskedId}>{method.accountMasked}</Text>
                      </View>
                      {method.isPrimary ? (
                        <View style={styles.primaryPaymentMethodBadge}>
                          <Text style={styles.primaryPaymentMethodBadgeText}>Primary</Text>
                        </View>
                      ) : (
                        <Feather name="chevron-right" size={16} color="#7E8B97" />
                      )}
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.addPayoutLink}
                  activeOpacity={0.8}
                  onPress={() => openPayoutEditor()}>
                  <Feather name="plus" size={16} color="#4E929D" />
                  <Text style={styles.addPayoutLinkText}>Add Payout Method</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          <SectionHeader title="Document Vault" />
          <View style={styles.settingCardWrapper}>
            <SettingRow
              icon="shield"
              title="Document Vault & Security"
              subtitle="A private section for handling sensitive legal documents."
              expanded={expandedSection === 'vault'}
              onPress={() => toggleSection('vault')}
            />

            {expandedSection === 'vault' ? (
              <>
                {documents.length === 0 ? (
                  <Text style={styles.emptyListText}>No documents uploaded yet.</Text>
                ) : (
                  documents.map(doc => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.vaultDocumentLineItemRow}
                      activeOpacity={0.8}
                      onLongPress={() => handleRemoveDocument(doc)}>
                      <View style={styles.vaultDocumentLeftMetaGroup}>
                        <Feather name="file-text" size={18} color="#1A1C1E" />
                        <Text style={styles.vaultDocumentTitleFileName}>{doc.fileName}</Text>
                      </View>
                      <View
                        style={[
                          styles.vaultDocumentVerifiedBadge,
                          doc.status !== 'VERIFIED' && styles.vaultDocumentPendingBadge,
                        ]}>
                        <Text
                          style={[
                            styles.vaultDocumentVerifiedBadgeText,
                            doc.status !== 'VERIFIED' && styles.vaultDocumentPendingBadgeText,
                          ]}>
                          {doc.status === 'VERIFIED' ? 'Verified' : 'Pending'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.uploadVaultDocumentButton}
                  activeOpacity={0.8}
                  disabled={uploadingDoc}
                  onPress={handleUploadDocument}>
                  {uploadingDoc ? (
                    <ActivityIndicator color="#1A1C1E" size="small" />
                  ) : (
                    <>
                      <Feather name="plus" size={18} color="#1A1C1E" />
                      <Text style={styles.uploadVaultDocumentButtonText}>Upload New Document</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          <SectionHeader title="App Settings" />
          <View style={styles.appLinksCardContainer}>
            <TouchableOpacity
              style={styles.appSettingsLinkRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Notifications')}>
              <View style={styles.appSettingsLinkLeftGroup}>
                <Feather name="bell" size={18} color="#4E929D" />
                <View>
                  <Text style={styles.appSettingsMainLabel}>Notifications</Text>
                  <Text style={styles.appSettingsSubLabel}>Manage reminders and alerts</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color="#7E8B97" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.appSettingsLinkRow}
              activeOpacity={0.7}
              onPress={() => setChangePwVisible(true)}>
              <View style={styles.appSettingsLinkLeftGroup}>
                <Feather name="lock" size={18} color="#4E929D" />
                <View>
                  <Text style={styles.appSettingsMainLabel}>Change Password</Text>
                  <Text style={styles.appSettingsSubLabel}>Update your account password</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color="#7E8B97" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.appSettingsLinkRow, styles.appSettingsLinkRowLast]}
              activeOpacity={0.7}>
              <View style={styles.appSettingsLinkLeftGroup}>
                <Feather name="globe" size={18} color="#4E929D" />
                <View>
                  <Text style={styles.appSettingsMainLabel}>Language</Text>
                  <Text style={styles.appSettingsSubLabel}>English</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color="#7E8B97" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert('Logout', 'Are you sure?', [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Logout', style: 'destructive', onPress: () => void performLogout()},
              ])
            }>
            <Feather name="log-out" size={18} color="#E26D6D" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountBtn}
            activeOpacity={0.85}
            onPress={confirmAndDeleteAccount}>
            <Feather name="trash-2" size={18} color="#E26D6D" />
            <Text style={styles.logoutBtnText}>Delete account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <VendorBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
      <VendorChangePasswordModal visible={changePwVisible} onClose={() => setChangePwVisible(false)} />
      <VendorEditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        pharmacyName={editPharmacyName}
        onPharmacyNameChange={setEditPharmacyName}
        phone={editPhone}
        onPhoneChange={setEditPhone}
        address={editAddress}
        onAddressChange={setEditAddress}
        bannerUrl={editBannerUrl}
        onBannerUrlChange={setEditBannerUrl}
        saving={editSaving}
        onSave={handleSaveProfile}
      />

      <Modal
        visible={payoutModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPayoutModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.epOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.epModal}>
            <View style={styles.epHeader}>
              <Text style={styles.epTitle}>
                {payoutEdit ? 'Edit Payout Method' : 'Add Payout Method'}
              </Text>
              <TouchableOpacity onPress={() => setPayoutModalVisible(false)} activeOpacity={0.7}>
                <Feather name="x" size={22} color="#1A1C1E" />
              </TouchableOpacity>
            </View>
            <View style={styles.epField}>
              <Text style={styles.epLabel}>Label</Text>
              <TextInput
                style={styles.epInput}
                placeholder="e.g. Dutch Bangla Bank"
                placeholderTextColor="#9AA6B2"
                value={payoutLabel}
                onChangeText={setPayoutLabel}
              />
            </View>
            <View style={styles.epField}>
              <Text style={styles.epLabel}>Account / Number</Text>
              <TextInput
                style={styles.epInput}
                placeholder="Masked account display"
                placeholderTextColor="#9AA6B2"
                value={payoutAccount}
                onChangeText={setPayoutAccount}
              />
            </View>
            <View style={styles.payoutTypeRow}>
              {(['BANK', 'BKASH', 'NAGAD'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.payoutTypeChip,
                    payoutType === type && styles.payoutTypeChipActive,
                  ]}
                  onPress={() => setPayoutType(type)}>
                  <Text
                    style={[
                      styles.payoutTypeChipText,
                      payoutType === type && styles.payoutTypeChipTextActive,
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.epSaveBtn, payoutSaving && styles.epSaveBtnDisabled]}
              onPress={savePayoutMethod}
              disabled={payoutSaving}
              activeOpacity={0.85}>
              {payoutSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.epSaveBtnText}>Save Method</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EFF8',
  },
  loader: {
    marginTop: 40,
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F4F1FD',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  storeMainCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    ...CARD_SHADOW,
    elevation:0,
  },
  storeBannerImage: {
    width: '100%',
    height: 125,
    resizeMode: 'cover',
  },
  storeTextInfoBlock: {
    padding: 14,
  },
  storeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeNameText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#47B39D',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F4FAF8',
  },
  verifiedBadgeText: {
    fontSize: 10,
    color: '#47B39D',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  pharmacistCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    ...CARD_SHADOW,
     elevation:0,
  },
  pharmacistSectionLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.semibold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pharmacistProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
    paddingBottom: 12,
  },
  pharmacistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  pharmacistDetails: {
    flex: 1,
  },
  pharmacistName: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  pharmacistReg: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  licenseFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  licenseNumberText: {
    fontSize: 12,
    color: '#4F5E6D',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  licenseStatusText: {
    fontSize: 12,
    color: '#00A884',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  metricsRowGroup: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  metricScoreBox: {
    flex: 1,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...CARD_SHADOW,
     elevation:0,
  },
  metricScoreValue: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4E929D',
  },
  metricScoreLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 2,
  },
  groupSectionTitle: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4F5E6D',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settingCardWrapper: {
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    ...CARD_SHADOW,
     elevation:0,
  },
  settingRowHeaderLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
    paddingBottom: 12,
  },
  settingRowHeaderLinkCollapsed: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingIconLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextBlock: {
    flex: 1,
  },
  settingIconBackground: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRowMainTitle: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  settingRowSubTitle: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  storeStatusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleRowMainText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  statusOpenText: {
    color: '#00A884',
  },
  statusClosedText: {
    color: '#E26D6D',
  },
  toggleRowSubText: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 1,
  },
  operationalSubContainer: {
    backgroundColor: '#F3F2FB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E2EF',
  },
  operationalHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
    paddingBottom: 8,
    marginBottom: 8,
  },
  operationalTitleMain: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4F5E6D',
  },
  controlItemLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  controlLabelText: {
    fontSize: 12,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  controlValueText: {
    fontSize: 12,
    color: '#1A1C1E',
    fontFamily: FONT.semibold,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  controlInput: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 8,
    height: 34,
    fontSize: 12,
    color: '#1A1C1E',
    textAlign: 'right',
  },
  emptyListText: {
    fontSize: 12,
    color: '#7E8B97',
    paddingVertical: 8,
  },
  addPayoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  addPayoutLinkText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4E929D',
  },
  payoutTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  payoutTypeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  payoutTypeChipActive: {
    backgroundColor: '#E6F3F5',
    borderColor: '#4E929D',
  },
  payoutTypeChipText: {
    fontSize: 11,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#64748B',
  },
  payoutTypeChipTextActive: {
    color: '#3F8694',
  },
  vaultDocumentPendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  vaultDocumentPendingBadgeText: {
    color: '#D97706',
  },
  saveOperationsButton: {
    backgroundColor: '#E26D6D',
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveOperationsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  revenueBannerCyanCard: {
    backgroundColor: '#4DA69F',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  revenueBannerLabel: {
    fontSize: 12,
    color: '#E6F3F5',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  revenueBannerValue: {
    fontSize: 26,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  payoutNoticeBadge: {
    backgroundColor: '#E26D6D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 4,
  },
  payoutNoticeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  payoutListHeaderLabel: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4F5E6D',
    marginTop: 16,
    marginBottom: 4,
  },
  paymentMethodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
  },
  paymentMethodMeta: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitleName: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  paymentMethodMaskedId: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 1,
  },
  primaryPaymentMethodBadge: {
    borderWidth: 1,
    borderColor: '#47B39D',
    backgroundColor: '#F4FAF8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  primaryPaymentMethodBadgeText: {
    color: '#47B39D',
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  miniBKashIconMock: {
    width: 22,
    height: 22,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2136E',
  },
  miniBrandLetter: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  vaultDocumentLineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
  },
  vaultDocumentLeftMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  vaultDocumentTitleFileName: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333D47',
    flex: 1,
  },
  vaultDocumentVerifiedBadge: {
    backgroundColor: '#E6F7ED',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vaultDocumentVerifiedBadgeText: {
    color: '#47B39D',
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  uploadVaultDocumentButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#3F8694',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 2,
    gap: 6,
  },
  uploadVaultDocumentButtonText: {
    color: '#1A1C1E',
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  appLinksCardContainer: {
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
    ...CARD_SHADOW,
  },
  appSettingsLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
  },
  appSettingsLinkRowLast: {
    borderBottomWidth: 0,
  },
  appSettingsLinkLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appSettingsMainLabel: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  appSettingsSubLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FCECEC',
    borderWidth: 1,
    borderColor: '#F9D5D5',
    borderRadius: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    backgroundColor: '#FCECEC',
    borderWidth: 1,
    borderColor: '#F9D5D5',
    borderRadius: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  logoutBtnText: {color: '#E26D6D', fontSize: 13, fontFamily: FONT.semibold, fontWeight: '600'},
  cpOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  cpModal: {
    backgroundColor: '#F5F4FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  cpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cpTitle: {fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A1C1E'},
  cpField: {marginBottom: 14},
  cpLabel: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#4F5E6D', marginBottom: 6},
  cpInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#1A1C1E',
  },
  cpSaveBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cpSaveBtnDisabled: {opacity: 0.6},
  cpSaveBtnText: {color: '#FFFFFF', fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600'},
  epOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  epModal: {
    backgroundColor: '#F5F4FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  epHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  epTitle: {fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A1C1E'},
  epField: {marginBottom: 14},
  epLabel: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#4F5E6D', marginBottom: 6},
  epInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#1A1C1E',
  },
  epInputMultiline: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  epBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4E929D',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  epBannerBtnText: {
    color: '#4E929D',
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  epSaveBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  epSaveBtnDisabled: {opacity: 0.6},
  epSaveBtnText: {color: '#FFFFFF', fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600'},
});
