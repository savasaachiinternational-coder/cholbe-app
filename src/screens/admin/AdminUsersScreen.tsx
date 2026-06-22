import {useState} from 'react';
import {
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {ADMIN_USER_FILTERS, type AdminUserFilter} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AUsers'>;

type UserRecord = {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
};

const MOCK_USERS: UserRecord[] = Array.from({length: 7}, () => ({
  name: 'Rayhan Ullah',
  email: 'rayhan@gmail.com',
  phone: '01677589448',
  joinDate: '18 May,2027',
}));

function UserCard({item, isLast}: {item: UserRecord; isLast: boolean}) {
  return (
    <View style={[styles.userCardRow, isLast && styles.userCardRowLast]}>
      <Image
        source={{uri: 'https://via.placeholder.com/52/E2E8F0/000000?text=User'}}
        style={styles.userAvatar}
      />

      <View style={styles.metaInfoColumn}>
        <Text style={styles.userNameText}>{item.name}</Text>
        <Text style={styles.userEmailText}>{item.email}</Text>

        <View style={styles.phoneInlineRow}>
          <Feather name="phone" size={12} color="#7E8B97" />
          <Text style={styles.userPhoneText}>{item.phone}</Text>
        </View>
      </View>

      <Text style={styles.joinDateText}>{item.joinDate}</Text>
    </View>
  );
}

export function AdminUsersScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminUserFilter>('Customers');

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {ADMIN_USER_FILTERS.map(filterItem => {
            const isFilterActive = activeFilter === filterItem;
            return (
              <TouchableOpacity
                key={filterItem}
                style={[styles.chipItem, isFilterActive && styles.chipItemActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filterItem)}>
                <Text style={[styles.chipItemText, isFilterActive && styles.chipItemActiveText]}>
                  {filterItem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.directoryContainerCard}>
          {MOCK_USERS.map((user, index) => (
            <UserCard
              key={`${user.email}-${index}`}
              item={user}
              isLast={index === MOCK_USERS.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="user" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
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
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chipItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F3F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipItemActive: {
    backgroundColor: '#4E929D',
  },
  chipItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E8B97',
  },
  chipItemActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  directoryContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingTop: 8,
    paddingBottom: 4,
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
    position: 'relative',
    minHeight: 88,
  },
  userCardRowLast: {
    borderBottomWidth: 0,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  metaInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 72,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  userEmailText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 1,
  },
  phoneInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  userPhoneText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
  },
  joinDateText: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
  },
});
