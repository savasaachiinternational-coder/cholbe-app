import {useState} from 'react';
import {
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
import {DOCTOR_CATEGORIES, DOCTOR_LIST_ITEMS} from './doctorListData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;
const CATEGORY_WIDTH = (SCREEN_WIDTH - 52) / 3;

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;

export function DoctorListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

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
          <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="arrow-right" size={14} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {DOCTOR_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, {width: CATEGORY_WIDTH}]}
              activeOpacity={0.8}>
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
          <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.doctorsGridContainer}>
          {DOCTOR_LIST_ITEMS.map(doc => (
            <View key={doc.id} style={styles.doctorProductCard}>
              <Image source={doc.image} style={styles.doctorImgCard} />
              <View style={styles.cardContentBlock}>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyBadgeText}>{doc.specialty}</Text>
                </View>
                <Text style={styles.doctorNameText} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text style={styles.doctorDegreeText} numberOfLines={2}>
                  {doc.degree}
                </Text>
                <Text style={styles.feeText}>{doc.fee}</Text>
                <TouchableOpacity
                  style={styles.appointmentButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('BookVideoCall', {
                      doctorName: doc.name,
                      specialty: doc.specialty,
                      consultationFee: 'BDT 800',
                    })
                  }>
                  <Text style={styles.appointmentButtonText}>
                    Book Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    marginTop: 8,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
  },
  filterInlineButton: {
    paddingLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  availableHeader: {
    marginTop: 24,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  sectionHeadingLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  categoryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  doctorsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  doctorProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: CARD_WIDTH,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  doctorImgCard: {
    width: '100%',
    height: 125,
    backgroundColor: '#E2E8F0',
    resizeMode: 'cover',
  },
  cardContentBlock: {
    padding: 10,
  },
  specialtyBadge: {
    backgroundColor: '#84CC16',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  specialtyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  doctorNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorDegreeText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 2,
    height: 28,
  },
  feeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
    marginBottom: 10,
  },
  appointmentButton: {
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  appointmentButtonText: {
    color: '#14B8A6',
    fontSize: 12,
    fontWeight: '600',
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
  },
});
