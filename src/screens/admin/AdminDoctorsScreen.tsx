import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {specialtiesApi, type Specialty} from '../../api/specialties';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ADoctors'>;

type DoctorRow = {
  id: string;
  specialty: string;
  fee: string | number;
  status: string;
  reviewAverage?: number;
  reviewCount?: number;
  user: {fullName: string; email: string | null; phone: string | null};
  specialtyRef?: {id: string; name: string} | null;
};

const STATUS_FILTERS = ['All', 'PENDING', 'ACTIVE', 'INACTIVE'] as const;

function StarRating({value}: {value: number}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesome
          key={i}
          name="star"
          size={10}
          color={i <= Math.round(value) ? '#FBBF24' : '#CBD5E1'}
          style={{marginRight: 1}}
        />
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({row: {flexDirection: 'row', alignItems: 'center'}});

export function AdminDoctorsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<DoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [fee, setFee] = useState('500');
  const [degree, setDegree] = useState('MBBS');
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    specialtiesApi.list().then(setSpecialties).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.doctors(filter === 'All' ? undefined : filter);
      setItems(data as DoctorRow[]);
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const create = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Doctors', 'Name and email are required.');
      return;
    }
    setCreating(true);
    try {
      await adminApi.createDoctor({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        specialty: selectedSpecialty?.name ?? 'General Physician',
        specialtyId: selectedSpecialty?.id,
        degree: degree.trim() || undefined,
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
      setDegree('MBBS');
      setFee('500');
      setSelectedSpecialty(null);
      setShowCreate(false);
      load();
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateDoctor(id, {status});
      load();
    } catch (err) {
      Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const remove = async (id: string, name: string) => {
    Alert.alert('Delete Doctor', `Remove ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteDoctor(id);
            load();
          } catch (err) {
            Alert.alert('Doctors', err instanceof ApiError ? err.message : 'Delete failed');
          }
        },
      },
    ]);
  };

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return '#0D9488';
    if (s === 'PENDING') return '#F59E0B';
    return '#94A3B8';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Doctors</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowCreate(true)}>
          <Feather name="user-plus" size={22} color="#0D9488" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#0D9488" style={{marginTop: 24}} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No doctors found.</Text>
        ) : (
          items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ADoctorEdit', {doctorId: item.id})}>
              <View style={styles.cardTop}>
                <View style={styles.avatarCircle}>
                  <Feather name="user" size={20} color="#0D9488" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.user.fullName}</Text>
                  <Text style={styles.cardSub}>
                    {item.specialtyRef?.name ?? item.specialty} • ৳{item.fee}
                  </Text>
                  {item.user.email ? (
                    <Text style={styles.cardEmail}>{item.user.email}</Text>
                  ) : null}
                  {(item.reviewCount ?? 0) > 0 ? (
                    <View style={styles.ratingRow}>
                      <StarRating value={item.reviewAverage ?? 0} />
                      <Text style={styles.ratingText}>
                        {Number(item.reviewAverage ?? 0).toFixed(1)} ({item.reviewCount})
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.statusBadge, {borderColor: statusColor(item.status)}]}>
                  <Text style={[styles.statusText, {color: statusColor(item.status)}]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('ADoctorEdit', {doctorId: item.id})}>
                  <Feather name="edit-2" size={14} color="#0D9488" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {item.status !== 'ACTIVE' ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={e => {e.stopPropagation?.(); setStatus(item.id, 'ACTIVE');}}>
                    <Text style={styles.actionBtnText}>Activate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={e => {e.stopPropagation?.(); setStatus(item.id, 'INACTIVE');}}>
                    <Text style={styles.actionBtnText}>Deactivate</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.dangerBtn]}
                  onPress={e => {e.stopPropagation?.(); remove(item.id, item.user.fullName);}}>
                  <Feather name="trash-2" size={14} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <AdminBottomNav activeTab="user" bottomInset={insets.bottom} navigation={navigation} />

      {/* Create Doctor Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={[modal.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={modal.sheetHeader}>
              <Text style={modal.sheetTitle}>Add Doctor</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modal.label}>Full Name *</Text>
              <TextInput style={modal.input} placeholder="Dr. Name" value={fullName} onChangeText={setFullName} />
              <Text style={modal.label}>Email *</Text>
              <TextInput
                style={modal.input}
                placeholder="doctor@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={modal.label}>Phone</Text>
              <TextInput
                style={modal.input}
                placeholder="01XXXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={modal.label}>Specialty *</Text>
              <TouchableOpacity
                style={modal.picker}
                onPress={() => setShowSpecialtyPicker(true)}>
                <Text style={selectedSpecialty ? modal.pickerValue : modal.pickerPlaceholder}>
                  {selectedSpecialty?.name ?? 'Select specialty'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
              <Text style={modal.label}>Degree</Text>
              <TextInput style={modal.input} placeholder="MBBS, FCPS..." value={degree} onChangeText={setDegree} />
              <Text style={modal.label}>Fee (৳)</Text>
              <TextInput
                style={modal.input}
                placeholder="500"
                value={fee}
                onChangeText={setFee}
                keyboardType="numeric"
              />
              <TouchableOpacity style={modal.submitBtn} onPress={create} disabled={creating}>
                {creating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={modal.submitText}>Create Doctor</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Specialty Picker Modal */}
      <Modal visible={showSpecialtyPicker} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={[modal.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={modal.sheetHeader}>
              <Text style={modal.sheetTitle}>Select Specialty</Text>
              <TouchableOpacity onPress={() => setShowSpecialtyPicker(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {specialties.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    modal.specialtyRow,
                    selectedSpecialty?.id === s.id && modal.specialtyRowActive,
                  ]}
                  onPress={() => {
                    setSelectedSpecialty(s);
                    setShowSpecialtyPicker(false);
                  }}>
                  <Text
                    style={[
                      modal.specialtyName,
                      selectedSpecialty?.id === s.id && modal.specialtyNameActive,
                    ]}>
                    {s.name}
                  </Text>
                  {selectedSpecialty?.id === s.id && (
                    <Feather name="check" size={16} color="#0D9488" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {width: 32, alignItems: 'center'},
  title: {flex: 1, textAlign: 'center', fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  content: {padding: 16},
  filters: {marginBottom: 16},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: {backgroundColor: '#0D9488'},
  chipText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569'},
  chipTextActive: {color: '#FFF'},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {flexDirection: 'row', alignItems: 'flex-start'},
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {flex: 1},
  cardTitle: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  cardSub: {fontSize: 12, color: '#64748B', marginTop: 2},
  cardEmail: {fontSize: 11, color: '#94A3B8', marginTop: 1},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4},
  ratingText: {fontSize: 11, color: '#64748B'},
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {fontSize: 10, fontFamily: FONT.semibold, fontWeight: '600'},
  actions: {flexDirection: 'row', marginTop: 12, gap: 8},
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  editBtnText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#0D9488'},
  actionBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569'},
  dangerBtn: {borderColor: '#FECACA'},
  emptyText: {textAlign: 'center', color: '#94A3B8', marginTop: 40},
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  label: {fontSize: 13, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569', marginBottom: 4, marginTop: 10},
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    color: '#1E293B',
  },
  picker: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {fontSize: 14, color: '#1E293B'},
  pickerPlaceholder: {fontSize: 14, color: '#94A3B8'},
  submitBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {color: '#FFF', fontFamily: FONT.semibold, fontWeight: '600', fontSize: 15},
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specialtyRowActive: {backgroundColor: '#F0FDFA', borderRadius: 8},
  specialtyName: {fontSize: 14, color: '#1E293B'},
  specialtyNameActive: {color: '#0D9488', fontFamily: FONT.semibold, fontWeight: '600'},
});
