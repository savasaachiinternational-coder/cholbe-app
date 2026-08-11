import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {ADMIN_USER_FILTERS, type AdminUserFilter} from './adminNav';
import {adminApi} from '../../api/admin';
import {type PublicUser} from '../../api/auth';
import {ApiError} from '../../api/client';
import {NotificationBell} from '../../components/NotificationBell';
import {AvatarImage} from '../../components/AvatarImage';

type Props = NativeStackScreenProps<RootStackParamList, 'AUsers'>;

type DoctorRow = {
  id: string;
  specialty: string;
  fee: string | number;
  status: string;
  user: {fullName: string; email: string | null; phone: string | null};
};

type SpecialtyRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

const DOCTOR_FILTERS = ['All', 'PENDING', 'ACTIVE', 'INACTIVE'] as const;

function filterParams(filter: AdminUserFilter) {
  if (filter === 'Customers') return {role: 'CUSTOMER'};
  if (filter === 'Vendors') return {role: 'VENDOR'};
  if (filter === 'Blocked') return {status: 'BLOCKED'};
  return undefined;
}

function screenTitle(filter: AdminUserFilter) {
  if (filter === 'Doctors') return 'Doctors';
  if (filter === 'Specialties') return 'Specialties';
  return 'Users';
}

function formatJoinDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeColor(status: string) {
  if (status === 'ACTIVE') return '#00A884';
  if (status === 'BLOCKED') return '#E26D6D';
  return '#FFA500';
}

function UserCard({
  item,
  isLast,
  onToggleBlock,
  onDelete,
  updating,
}: {
  item: PublicUser;
  isLast: boolean;
  onToggleBlock: () => void;
  onDelete: () => void;
  updating: boolean;
}) {
  return (
    <View style={[styles.userCardRow, isLast && styles.userCardRowLast]}>
      <AvatarImage uri={item.avatarUrl} style={styles.userAvatar} />
      <View style={styles.metaInfoColumn}>
        <Text style={styles.userNameText}>{item.fullName}</Text>
        <Text style={styles.userEmailText}>{item.email ?? '—'}</Text>
        <View style={styles.phoneInlineRow}>
          <Feather name="phone" size={12} color="#7E8B97" />
          <Text style={styles.userPhoneText}>{item.phone ?? '—'}</Text>
        </View>
        <View style={styles.userActionsRow}>
          <View style={[styles.statusDot, {backgroundColor: statusBadgeColor(item.status)}]} />
          <Text style={[styles.statusDotText, {color: statusBadgeColor(item.status)}]}>
            {item.status}
          </Text>
          <TouchableOpacity
            style={styles.actionChip}
            disabled={updating}
            onPress={onToggleBlock}>
            <Text style={styles.actionChipText}>
              {item.status === 'BLOCKED' ? 'Unblock' : 'Block'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionChip, styles.dangerChip]}
            disabled={updating}
            onPress={onDelete}>
            <Feather name="trash-2" size={12} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.joinDateText}>{formatJoinDate(item.createdAt)}</Text>
    </View>
  );
}

export function AdminUsersScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminUserFilter>(
    route.params?.initialFilter ?? 'Customers',
  );
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyRow[]>([]);
  const [doctorStatusFilter, setDoctorStatusFilter] =
    useState<(typeof DOCTOR_FILTERS)[number]>('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtyName, setSpecialtyName] = useState('General Physician');
  const [fee, setFee] = useState('500');
  const [newSpecialtyName, setNewSpecialtyName] = useState('');

  useEffect(() => {
    if (route.params?.initialFilter) {
      setActiveFilter(route.params.initialFilter);
      if (route.params.initialFilter === 'Doctors') {
        setShowAddDoctor(true);
      }
    }
  }, [route.params?.initialFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterParams(activeFilter);
      const data = await adminApi.users(params?.role, params?.status);
      setUsers(data as PublicUser[]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load users';
      Alert.alert('Users', message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.doctors(
        doctorStatusFilter === 'All' ? undefined : doctorStatusFilter,
      );
      setDoctors(data as DoctorRow[]);
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Could not load doctors');
    } finally {
      setLoading(false);
    }
  }, [doctorStatusFilter]);

  const loadSpecialties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.specialties();
      setSpecialties(data);
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Could not load specialties');
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => {
    if (activeFilter === 'Doctors') return loadDoctors();
    if (activeFilter === 'Specialties') return loadSpecialties();
    return loadUsers();
  }, [activeFilter, loadDoctors, loadSpecialties, loadUsers]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    if (activeFilter === 'Doctors') {
      loadDoctors();
    }
  }, [doctorStatusFilter, activeFilter, loadDoctors]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      u =>
        u.fullName.toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.phone?.includes(q) ?? false),
    );
  }, [users, search]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      d =>
        d.user.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        (d.user.email?.toLowerCase().includes(q) ?? false),
    );
  }, [doctors, search]);

  const filteredSpecialties = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return specialties;
    return specialties.filter(
      s => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [specialties, search]);

  const handleToggleBlock = useCallback(
    async (user: PublicUser) => {
      const nextStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      setUpdatingUserId(user.id);
      try {
        await adminApi.updateUserStatus(user.id, nextStatus);
        await loadUsers();
      } catch (err) {
        Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not update user status');
      } finally {
        setUpdatingUserId(null);
      }
    },
    [loadUsers],
  );

  const handleDeleteUser = useCallback(
    (user: PublicUser) => {
      Alert.alert('Delete User', `Remove "${user.fullName}" permanently?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUpdatingUserId(user.id);
            try {
              await adminApi.deleteUser(user.id);
              await loadUsers();
            } catch (err) {
              Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not delete user');
            } finally {
              setUpdatingUserId(null);
            }
          },
        },
      ]);
    },
    [loadUsers],
  );

  const createDoctor = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Doctors', 'Name and email are required.');
      return;
    }
    try {
      await adminApi.createDoctor({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        specialty: specialtyName.trim(),
        fee: Number(fee) || 500,
        status: 'PENDING',
        weeklyAvailability: [1, 2, 3, 4, 5].map(dayOfWeek => ({
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          slotMinutes: 30,
          isActive: true,
        })),
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setShowAddDoctor(true);
      loadDoctors();
      Alert.alert('Doctors', 'Doctor added successfully.');
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Create failed');
    }
  };

  const setDoctorStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateDoctor(id, {status});
      loadDoctors();
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const removeDoctor = async (id: string) => {
    Alert.alert('Delete doctor', 'Remove this doctor permanently?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteDoctor(id);
            loadDoctors();
          } catch (err) {
            Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Delete failed');
          }
        },
      },
    ]);
  };

  const createSpecialty = async () => {
    if (!newSpecialtyName.trim()) return;
    try {
      await adminApi.createSpecialty({name: newSpecialtyName.trim()});
      setNewSpecialtyName('');
      loadSpecialties();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Create failed');
    }
  };

  const toggleSpecialty = async (item: SpecialtyRow) => {
    try {
      await adminApi.updateSpecialty(item.id, {isActive: !item.isActive});
      loadSpecialties();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const removeSpecialty = async (id: string) => {
    try {
      await adminApi.deleteSpecialty(id);
      loadSpecialties();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle(activeFilter)}</Text>
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
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
            value={search}
            onChangeText={setSearch}
          />
          {activeFilter === 'Doctors' ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAddDoctor(v => !v)}>
              <Feather name={showAddDoctor ? 'minus-circle' : 'plus-circle'} size={22} color="#4E929D" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.7}>
              <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
            </TouchableOpacity>
          )}
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
                onPress={() => {
                  setActiveFilter(filterItem);
                  setSearch('');
                  if (filterItem === 'Doctors') setShowAddDoctor(true);
                }}>
                <Text style={[styles.chipItemText, isFilterActive && styles.chipItemActiveText]}>
                  {filterItem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeFilter === 'Doctors' ? (
          <>
            {showAddDoctor ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Doctor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone (optional)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Specialty"
                  value={specialtyName}
                  onChangeText={setSpecialtyName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Consultation fee"
                  value={fee}
                  onChangeText={setFee}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={createDoctor}>
                  <Text style={styles.primaryBtnText}>Create Doctor</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subFiltersContent}>
              {DOCTOR_FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chipItem, doctorStatusFilter === f && styles.chipItemActive]}
                  onPress={() => setDoctorStatusFilter(f)}>
                  <Text
                    style={[
                      styles.chipItemText,
                      doctorStatusFilter === f && styles.chipItemActiveText,
                    ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.directoryContainerCard}>
              {loading ? (
                <ActivityIndicator color="#4E929D" style={styles.loader} />
              ) : filteredDoctors.length === 0 ? (
                <Text style={styles.emptyText}>No doctors found.</Text>
              ) : (
                filteredDoctors.map((doctor, index) => (
                  <TouchableOpacity
                    key={doctor.id}
                    activeOpacity={0.85}
                    style={[
                      styles.doctorCardRow,
                      index === filteredDoctors.length - 1 && styles.userCardRowLast,
                    ]}
                    onPress={() =>
                      navigation.navigate('ADoctorEdit', {doctorId: doctor.id})
                    }>
                    <View style={styles.doctorMeta}>
                      <Text style={styles.userNameText}>{doctor.user.fullName}</Text>
                      <Text style={styles.userEmailText}>
                        {doctor.specialty} • ৳{doctor.fee} • {doctor.status}
                      </Text>
                      <Text style={styles.userPhoneText}>{doctor.user.email ?? '—'}</Text>
                    </View>
                    <View style={styles.doctorActions}>
                      <TouchableOpacity
                        style={styles.actionChip}
                        onPress={() =>
                          navigation.navigate('ADoctorEdit', {doctorId: doctor.id})
                        }>
                        <Feather name="edit-2" size={14} color="#4E929D" />
                        <Text style={styles.actionChipText}>Edit</Text>
                      </TouchableOpacity>
                      {doctor.status !== 'ACTIVE' ? (
                        <TouchableOpacity
                          style={styles.actionChip}
                          onPress={() => setDoctorStatus(doctor.id, 'ACTIVE')}>
                          <Text style={styles.actionChipText}>Activate</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionChip}
                          onPress={() => setDoctorStatus(doctor.id, 'INACTIVE')}>
                          <Text style={styles.actionChipText}>Deactivate</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionChip, styles.dangerChip]}
                        onPress={() => removeDoctor(doctor.id)}>
                        <Feather name="trash-2" size={14} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : activeFilter === 'Specialties' ? (
          <>
            <View style={styles.createRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                placeholder="New specialty name"
                value={newSpecialtyName}
                onChangeText={setNewSpecialtyName}
              />
              <TouchableOpacity style={styles.primaryBtnInline} onPress={createSpecialty}>
                <Text style={styles.primaryBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.directoryContainerCard}>
              {loading ? (
                <ActivityIndicator color="#4E929D" style={styles.loader} />
              ) : filteredSpecialties.length === 0 ? (
                <Text style={styles.emptyText}>No specialties found.</Text>
              ) : (
                filteredSpecialties.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.specialtyRow,
                      index === filteredSpecialties.length - 1 && styles.userCardRowLast,
                    ]}>
                    <View style={{flex: 1}}>
                      <Text style={styles.userNameText}>{item.name}</Text>
                      <Text style={styles.userEmailText}>{item.slug}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionChip} onPress={() => toggleSpecialty(item)}>
                      <Text style={styles.actionChipText}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionChip, styles.dangerChip]}
                      onPress={() => removeSpecialty(item.id)}>
                      <Feather name="trash-2" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View style={styles.directoryContainerCard}>
            {loading ? (
              <ActivityIndicator color="#4E929D" style={styles.loader} />
            ) : filteredUsers.length === 0 ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : (
              filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  item={user}
                  isLast={index === filteredUsers.length - 1}
                  updating={updatingUserId === user.id}
                  onToggleBlock={() => handleToggleBlock(user)}
                  onDelete={() => handleDeleteUser(user)}
                />
              ))
            )}
          </View>
        )}
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
  subFiltersContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    minHeight: 120,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 8,
    color: '#1A1C1E',
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
  },
  createRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnInline: {
    backgroundColor: '#4E929D',
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 42,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loader: {marginVertical: 32},
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 14,
    paddingVertical: 32,
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
  doctorCardRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
    gap: 8,
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
  doctorMeta: {
    marginBottom: 8,
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
    marginTop: 2,
  },
  joinDateText: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  doctorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E929D',
  },
  dangerChip: {
    borderColor: '#FECACA',
  },
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotText: {
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
});
