import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import {DOCTOR_CATEGORIES} from './doctorListData';
import {doctorsApi, type Doctor} from '../../api/doctors';
import {ApiError} from '../../api/client';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;
const CATEGORY_WIDTH = (SCREEN_WIDTH - 52) / 3;
const DOCTOR_PLACEHOLDER = require('../../assets/b2.png');

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;

function formatFee(fee: string | number): string {
  const amount = typeof fee === 'string' ? Number(fee) : fee;
  return Number.isNaN(amount) ? `BDT ${fee}` : `BDT ${amount}`;
}

export function DoctorListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorsApi.list({
        search: searchQuery.trim() || undefined,
        category: activeCategory ?? undefined,
      });
      setDoctors(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load doctors';
      Alert.alert('Doctors', message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(loadDoctors, 300);
    return () => clearTimeout(timer);
  }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(
      d =>
        d.user.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q),
    );
  }, [doctors, searchQuery]);

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

  const bookDoctor = (doc: Doctor) => {
    navigation.navigate('BookVideoCall', {
      doctorId: doc.id,
      doctorName: doc.user.fullName,
      specialty: doc.specialty,
      consultationFee: formatFee(doc.fee),
    });
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
        <Text style={styles.headerTitle}>Doctor List</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Feather
              name="search"
              size={20}
              color="#94A3B8"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterInlineButton} activeOpacity={0.7}>
              <Feather name="sliders" size={18} color="#14B8A6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Explore Doctors Near You</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {DOCTOR_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {width: CATEGORY_WIDTH},
                activeCategory === cat.name && styles.categoryCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setActiveCategory(prev => (prev === cat.name ? null : cat.name))
              }>
              <View style={styles.categoryIconWrapper}>
                <Feather name={cat.icon} size={24} color="#64748B" />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.sectionHeaderRow, styles.availableHeader]}>
          <Text style={styles.sectionHeadingLarge}>Available Doctor</Text>
          <Text style={styles.viewAllText}>{filteredDoctors.length} found</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
        ) : filteredDoctors.length === 0 ? (
          <Text style={styles.emptyText}>No doctors match your search.</Text>
        ) : (
          <View style={styles.doctorsGridContainer}>
            {filteredDoctors.map(doc => (
              <View key={doc.id} style={[styles.doctorProductCard, {width: CARD_WIDTH}]}>
                <Image
                  source={
                    doc.imageUrl || doc.user.avatarUrl
                      ? {uri: doc.imageUrl ?? doc.user.avatarUrl ?? undefined}
                      : DOCTOR_PLACEHOLDER
                  }
                  style={styles.doctorImgCard}
                />
                <View style={styles.cardContentBlock}>
                  <View style={styles.specialtyBadge}>
                    <Text style={styles.specialtyBadgeText}>{doc.specialty}</Text>
                  </View>
                  <Text style={styles.doctorNameText} numberOfLines={1}>
                    {doc.user.fullName}
                  </Text>
                  <Text style={styles.doctorDegreeText} numberOfLines={2}>
                    {doc.degree ?? 'Licensed specialist'}
                  </Text>
                  <Text style={styles.feeText}>{formatFee(doc.fee)}</Text>
                  <TouchableOpacity
                    style={styles.appointmentButton}
                    activeOpacity={0.85}
                    onPress={() => bookDoctor(doc)}>
                    <Text style={styles.appointmentButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  searchRow: {
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0,
  },
  filterInlineButton: {
    padding: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionHeadingLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 13,
    color: '#64748B',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  categoryIconWrapper: {
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  availableHeader: {
    marginTop: 4,
  },
  doctorsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  doctorProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  doctorImgCard: {
    width: '100%',
    height: 100,
    backgroundColor: '#E2E8F0',
  },
  cardContentBlock: {
    padding: 10,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  specialtyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
  },
  doctorNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  doctorDegreeText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    minHeight: 28,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 8,
  },
  appointmentButton: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  appointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  loader: {
    marginVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 24,
  },
});
