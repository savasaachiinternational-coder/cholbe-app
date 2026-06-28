import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {vendorApi} from '../../api/vendor';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {productImageUrl} from '../../utils/pharmacyHelpers';
import {VendorBottomNav} from './VendorBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VProfile'>;
type ExpandedSection = 'store' | 'wallet' | 'vault' | null;

type VendorProfile = {
  id: string;
  pharmacyName: string;
  phone?: string | null;
  address?: string | null;
  isStoreOpen: boolean;
  bannerUrl?: string | null;
  user?: {fullName: string; phone?: string | null};
};

const VAULT_DOCUMENTS = ['Drug License_2024.pdf', 'Trade License_Uttara.png', 'NID-Card'];

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

export function VendorPharmacyProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorApi.dashboard();
      const profile = (data as {vendor: VendorProfile}).vendor;
      setVendor(profile);
      setIsStoreOpen(profile.isStoreOpen);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load profile';
      Alert.alert('Profile', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const saveProfile = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await vendorApi.updateProfile({isStoreOpen});
      setVendor(updated as VendorProfile);
      Alert.alert('Profile', 'Changes saved successfully.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save profile';
      Alert.alert('Profile', message);
    } finally {
      setSaving(false);
    }
  }, [isStoreOpen]);

  const toggleSection = (section: Exclude<ExpandedSection, null>) => {
    setExpandedSection(current => (current === section ? null : section));
  };

  const bannerUri = vendor?.bannerUrl
    ? productImageUrl(vendor.bannerUrl)
    : 'https://via.placeholder.com/350x150/A7F3D0/000000?text=Pharmacy+Interior';

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
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
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
            <Image source={{uri: bannerUri}} style={styles.storeBannerImage} />
            <View style={styles.storeTextInfoBlock}>
              <View style={styles.storeTitleRow}>
                <Text style={styles.storeNameText}>{vendor?.pharmacyName ?? '—'}</Text>
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={12} color="#47B39D" />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
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
              <Image
                source={{uri: 'https://via.placeholder.com/50/CBD5E1/000000?text=Doctor'}}
                style={styles.pharmacistAvatar}
              />
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
              <Text style={styles.metricScoreValue}>4.8</Text>
              <Text style={styles.metricScoreLabel}>Rating</Text>
            </View>
            <View style={styles.metricScoreBox}>
              <Text style={styles.metricScoreValue}>98%</Text>
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
                    <TouchableOpacity activeOpacity={0.7}>
                      <Feather name="edit-2" size={14} color="#1A1C1E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Pharmacy Name</Text>
                    <Text style={styles.controlValueText}>{vendor?.pharmacyName ?? '—'}</Text>
                  </View>
                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Address</Text>
                    <Text style={styles.controlValueText}>{vendor?.address ?? '—'}</Text>
                  </View>
                  <View style={styles.controlItemLineRow}>
                    <Text style={styles.controlLabelText}>Contact Phone</Text>
                    <Text style={styles.controlValueText}>
                      {vendor?.phone ?? vendor?.user?.phone ?? '—'}
                    </Text>
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
                  <Text style={styles.revenueBannerValue}>Tk 24,500</Text>
                  <View style={styles.payoutNoticeBadge}>
                    <Text style={styles.payoutNoticeText}>Next Auto-Payout: Sunday, 10 May</Text>
                  </View>
                </View>

                <Text style={styles.payoutListHeaderLabel}>Wallet & Payout</Text>

                <View style={styles.paymentMethodItemRow}>
                  <MaterialCommunityIcons name="bank-outline" size={22} color="#4E929D" />
                  <View style={styles.paymentMethodMeta}>
                    <Text style={styles.paymentMethodTitleName}>Dutch Bangla Bank</Text>
                    <Text style={styles.paymentMethodMaskedId}>xxx-xxx-5678</Text>
                  </View>
                  <View style={styles.primaryPaymentMethodBadge}>
                    <Text style={styles.primaryPaymentMethodBadgeText}>Primary</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.paymentMethodItemRow} activeOpacity={0.7}>
                  <View style={styles.miniBKashIconMock}>
                    <Text style={styles.miniBrandLetter}>b</Text>
                  </View>
                  <View style={styles.paymentMethodMeta}>
                    <Text style={styles.paymentMethodTitleName}>bkash Merchant</Text>
                    <Text style={styles.paymentMethodMaskedId}>017xx-xxx678</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#7E8B97" />
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
                {VAULT_DOCUMENTS.map(docName => (
                  <View key={docName} style={styles.vaultDocumentLineItemRow}>
                    <View style={styles.vaultDocumentLeftMetaGroup}>
                      <Feather name="file-text" size={18} color="#1A1C1E" />
                      <Text style={styles.vaultDocumentTitleFileName}>{docName}</Text>
                    </View>
                    <View style={styles.vaultDocumentVerifiedBadge}>
                      <Text style={styles.vaultDocumentVerifiedBadgeText}>Verified</Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.uploadVaultDocumentButton} activeOpacity={0.8}>
                  <Feather name="plus" size={18} color="#1A1C1E" />
                  <Text style={styles.uploadVaultDocumentButtonText}>Upload New Document</Text>
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
        </ScrollView>
      )}

      <VendorBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
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
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  storeMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEFF3',
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
    fontWeight: '700',
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
    fontWeight: '500',
  },
  pharmacistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  pharmacistSectionLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pharmacistProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
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
    fontWeight: '700',
    color: '#1A1C1E',
  },
  pharmacistReg: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
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
    fontWeight: '500',
  },
  licenseStatusText: {
    fontSize: 12,
    color: '#00A884',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4E929D',
  },
  metricScoreLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 2,
  },
  groupSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F5E6D',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settingCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  settingRowHeaderLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
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
    backgroundColor: '#E6F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRowMainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  settingRowSubTitle: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
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
    fontWeight: '700',
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
    fontWeight: '500',
    marginTop: 1,
  },
  operationalSubContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  operationalHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    paddingBottom: 8,
    marginBottom: 8,
  },
  operationalTitleMain: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '500',
  },
  controlValueText: {
    fontSize: 12,
    color: '#1A1C1E',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
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
    fontWeight: '600',
  },
  revenueBannerCyanCard: {
    backgroundColor: '#3F8694',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  revenueBannerLabel: {
    fontSize: 12,
    color: '#E6F3F5',
    fontWeight: '500',
  },
  revenueBannerValue: {
    fontSize: 26,
    fontWeight: '800',
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
    fontWeight: '600',
  },
  payoutListHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F5E6D',
    marginTop: 16,
    marginBottom: 4,
  },
  paymentMethodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  paymentMethodMeta: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitleName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  paymentMethodMaskedId: {
    fontSize: 11,
    color: '#7E8B97',
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
    fontWeight: 'bold',
  },
  vaultDocumentLineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  appLinksCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 8,
  },
  appSettingsLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
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
    fontWeight: '700',
    color: '#1A1C1E',
  },
  appSettingsSubLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 1,
  },
});
