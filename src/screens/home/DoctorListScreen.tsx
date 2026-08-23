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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  CATEGORY_MORE_IMAGE,
  DOCTOR_CATEGORIES,
  getCategoryImage,
} from './doctorListData';
import {doctorsApi, type Doctor} from '../../api/doctors';
import {specialtiesApi, type Specialty} from '../../api/specialties';
import {ApiError} from '../../api/client';
import {formatBdt} from '../../utils/pharmacyHelpers';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;
const CATEGORY_WIDTH = (SCREEN_WIDTH - 52) / 3;
/** Image tiles shown before the "More" tile is used to reveal the rest. */
const CATEGORY_TILE_LIMIT = 5;
const CATEGORY_TILE_WIDTH = (SCREEN_WIDTH - 56) / 3;
const DOCTOR_PLACEHOLDER = require('../../assets/b2.png');


type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;


function formatFee(fee: string | number): string {
  const amount = typeof fee === 'string' ? Number(fee) : fee;
  return Number.isNaN(amount) ? String(fee) : formatBdt(amount);
}


export function DoctorListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);


  useEffect(() => {
    specialtiesApi.list().then(setSpecialties).catch(() => setSpecialties([]));
  }, []);


  const categoryItems = useMemo(() => {
    if (specialties.length > 0) {
      return specialties.map(s => ({ key: s.id, label: s.name }));
    }
    return DOCTOR_CATEGORIES.map(c => ({ key: c.id, label: c.name }));
  }, [specialties]);


  const tileCategories = useMemo(
    () => categoryItems.filter(cat => cat.label.trim().toLowerCase() !== 'more'),
    [categoryItems],
  );
  const hasMoreCategories = tileCategories.length > CATEGORY_TILE_LIMIT;
  const visibleTileCategories =
    hasMoreCategories && !showAllCategories
      ? tileCategories.slice(0, CATEGORY_TILE_LIMIT)
      : tileCategories;


  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorsApi.list({
        search: searchQuery.trim() || undefined,
        category: activeCategory && !specialties.length ? activeCategory : undefined,
        specialtyId: specialties.length && activeCategory ? activeCategory : undefined,
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
              <MaterialIcons name="tune" size={18} color="#4DA69F" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Explore Doctors Near You</Text>
          <TouchableOpacity style={styles.sectionHeaderViewAll} activeOpacity={.85} onPress={()=>{}}>
            <Text style={styles.viewAllText}>View All</Text>
             <Feather name="arrow-right" size={12} color="#101828" />
          </TouchableOpacity>
         
        </View>


        <View style={styles.categoryTileGrid}>
          {visibleTileCategories.map(cat => {
            const artwork = getCategoryImage(cat.label);
            const active = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryTile,
                  {width: CATEGORY_TILE_WIDTH},
                  active && styles.categoryTileActive,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  setActiveCategory(prev => (prev === cat.key ? null : cat.key))
                }>
                <View style={styles.categoryTileIconWrap}>
                  {artwork ? (
                    <Image
                      source={artwork}
                      style={styles.categoryTileImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Feather name="activity" size={28} color="#64748B" />
                  )}
                </View>
                <Text
                  style={[
                    styles.categoryTileLabel,
                    active && styles.categoryTileLabelActive,
                  ]}
                  numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}


          {hasMoreCategories && (
            <TouchableOpacity
              style={[styles.categoryTile, {width: CATEGORY_TILE_WIDTH}]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                showAllCategories
                  ? 'Show fewer specialties'
                  : 'Show all specialties'
              }
              onPress={() => setShowAllCategories(prev => !prev)}>
              <View style={styles.categoryTileIconWrap}>
                <Image
                  source={CATEGORY_MORE_IMAGE}
                  style={styles.categoryTileImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.categoryTileLabel} numberOfLines={2}>
                {showAllCategories ? 'Less' : 'More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>


        {/* <View style={styles.categoriesGrid}>
          {categoryItems.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryCard,
                {width: CATEGORY_WIDTH},
                activeCategory === cat.key && styles.categoryCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setActiveCategory(prev => (prev === cat.key ? null : cat.key))
              }>
              <View style={styles.categoryIconWrapper}>
                <Feather name="activity" size={24} color="#64748B" />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}


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
                  // source={
                  //   doc.imageUrl || doc.user.avatarUrl
                  //     ? {uri: doc.imageUrl ?? doc.user.avatarUrl ?? require('../../assets/profile.png')}
                  //     : require('../../assets/profile.png')
                  // }
                  source={require('../../assets/profile.png')}
                  style={styles.doctorImgCard}
                  resizeMode='cover'
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
                  {(doc.reviewCount ?? 0) > 0 ? (
                    <View style={styles.ratingRow}>
                      <FontAwesome name="star" size={10} color="#FBBF24" />
                      <Text style={styles.ratingText}>
                        {Number(doc.reviewAverage ?? 0).toFixed(1)} ({doc.reviewCount})
                      </Text>
                    </View>
                  ) : null}
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
          <Image source={require('../../assets/syaiicon.png')} onProgress={()=>{}}/>
        {/* <Feather name="maximize" size={24} color="#1E293B" /> */}
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
    backgroundColor: '#F4F1FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F4F1FD',
  },
  backButton: {
    padding: 4,
    width: 24,
  },
  headerTitle: {
    fontSize: 18,
    paddingLeft:10,
    fontWeight: '600',
    color: '#424242',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  searchRow: {
    marginBottom: 16,
    height:56
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderRadius: 40,
    paddingHorizontal: 12,
    height: 56,
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
  sectionHeaderViewAll:{
    flexDirection:'row'
  },
  viewAllText:{
    color:'#424242',
    fontSize:10,
    fontWeight:400,
    paddingRight:8
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161',
  },
  sectionHeadingLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#616161',
  },
  // viewAllText: {
  //   fontSize: 13,
  //   color: '#64748B',
  // },
  categoryTileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryTile: {
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    padding:16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    minHeight: 104,
    elevation: 1,
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  categoryTileActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  categoryTileIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTileImage: {
    width: '100%',
    height: '100%',
  },
  categoryTileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 15,
  },
  categoryTileLabelActive: {
    color: '#0D9488',
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
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 4,
  },
  doctorImgCard: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    height:116
  },
  cardContentBlock: {
    paddingHorizontal: 4,
    paddingTop: 9,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8BC255',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom:4
  },
  specialtyBadgeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#F7FBFE',
  },
  doctorNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  doctorDegreeText: {
    fontSize: 10,
    fontWeight:'400',
    color: '#616161',
    marginBottom:4,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
    marginTop: -4,
  },
  ratingText: {fontSize: 10, color: '#64748B'},
  appointmentButton: {
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal:16,
    justifyContent:'center',
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#4DA69F',
    marginBottom:12
  },
  appointmentButtonText: {
    color: '#4DA69F',
    fontSize: 12,
    fontWeight: '400',
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