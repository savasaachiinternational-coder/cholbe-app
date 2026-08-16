import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi, type AdminDoctorDetail, type Experience, type Instruction, type Qualification} from '../../api/admin';
import {specialtiesApi, type Specialty} from '../../api/specialties';
import {ApiError} from '../../api/client';
import {DatePickerField, TimePickerField} from '../../components/MedicationPickers';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ADoctorEdit'>;

type Tab = 'profile' | 'qualifications' | 'experience' | 'instructions' | 'availability';

const TABS: {key: Tab; label: string; icon: string}[] = [
  {key: 'profile', label: 'Profile', icon: 'user'},
  {key: 'qualifications', label: 'Education', icon: 'book'},
  {key: 'experience', label: 'Experience', icon: 'briefcase'},
  {key: 'instructions', label: 'Training', icon: 'award'},
  {key: 'availability', label: 'Schedule', icon: 'calendar'},
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function StarRating({value}: {value: number}) {
  return (
    <View style={{flexDirection: 'row'}}>
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesome key={i} name="star" size={12} color={i <= Math.round(value) ? '#FBBF24' : '#CBD5E1'} style={{marginRight: 1}} />
      ))}
    </View>
  );
}

export function AdminDoctorEditScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {doctorId} = route.params;
  const [doctor, setDoctor] = useState<AdminDoctorDetail | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  // Profile edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [degree, setDegree] = useState('');
  const [fee, setFee] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [chamberAddress, setChamberAddress] = useState('');

  // Qualification modal
  const [showQualModal, setShowQualModal] = useState(false);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  const [qDegree, setQDegree] = useState('');
  const [qInstitution, setQInstitution] = useState('');
  const [qField, setQField] = useState('');
  const [qYearFrom, setQYearFrom] = useState('');
  const [qYearTo, setQYearTo] = useState('');

  // Experience modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eInstitution, setEInstitution] = useState('');
  const [eStartDate, setEStartDate] = useState('');
  const [eEndDate, setEEndDate] = useState('');
  const [eIsPresent, setEIsPresent] = useState(false);

  // Instruction modal
  const [showInstrModal, setShowInstrModal] = useState(false);
  const [editingInstr, setEditingInstr] = useState<Instruction | null>(null);
  const [iName, setIName] = useState('');
  const [iStartDate, setIStartDate] = useState('');
  const [iEndDate, setIEndDate] = useState('');
  const [iIsPresent, setIIsPresent] = useState(false);

  // Schedule slot modal
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdminDoctorDetail['weeklyAvailability'][number] | null>(null);
  const [slotDay, setSlotDay] = useState(1);
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('12:00');
  const [slotMinutes, setSlotMinutes] = useState('30');
  const [slotActive, setSlotActive] = useState(true);

  const SLOT_MINUTE_OPTIONS = ['15', '30', '45', '60'] as const;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, specs] = await Promise.all([
        adminApi.getDoctor(doctorId),
        specialtiesApi.list(),
      ]);
      setDoctor(d);
      setSpecialties(specs);
      setFullName(d.user.fullName);
      setPhone(d.user.phone ?? '');
      setDegree(d.degree ?? '');
      setFee(String(d.fee));
      setBio(d.bio ?? '');
      setStatus(d.status);
      setRegistrationNumber(d.registrationNumber ?? '');
      setChamberAddress(d.chamberAddress ?? '');
      const matchedSpec =
        specs.find(s => s.id === d.specialtyRef?.id) ??
        specs.find(s => s.name.toLowerCase() === d.specialty?.toLowerCase()) ??
        null;
      setSelectedSpecialty(matchedSpec);
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {load();}, [load]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await adminApi.updateDoctor(doctorId, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        specialty: selectedSpecialty?.name,
        specialtyId: selectedSpecialty?.id,
        degree: degree.trim() || undefined,
        fee: Number(fee) || undefined,
        bio: bio.trim() || undefined,
        status,
        registrationNumber: registrationNumber.trim() || undefined,
        chamberAddress: chamberAddress.trim() || undefined,
      });
      Alert.alert('Success', 'Profile updated');
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ─── Qualification handlers ──────────────────────────────────────────────────

  const openQualModal = (q?: Qualification) => {
    setEditingQual(q ?? null);
    setQDegree(q?.degree ?? '');
    setQInstitution(q?.institution ?? '');
    setQField(q?.fieldOfStudy ?? '');
    setQYearFrom(q?.yearFrom ? String(q.yearFrom) : '');
    setQYearTo(q?.yearTo ? String(q.yearTo) : '');
    setShowQualModal(true);
  };

  const saveQual = async () => {
    if (!qDegree.trim() || !qInstitution.trim()) {
      Alert.alert('Required', 'Degree and institution are required');
      return;
    }
    try {
      const payload = {
        degree: qDegree.trim(),
        institution: qInstitution.trim(),
        fieldOfStudy: qField.trim() || undefined,
        yearFrom: qYearFrom ? Number(qYearFrom) : undefined,
        yearTo: qYearTo ? Number(qYearTo) : undefined,
      };
      if (editingQual) {
        await adminApi.updateQualification(doctorId, editingQual.id, payload);
      } else {
        await adminApi.addQualification(doctorId, payload);
      }
      setShowQualModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed');
    }
  };

  const deleteQual = (q: Qualification) => {
    Alert.alert('Delete', `Remove ${q.degree} from ${q.institution}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await adminApi.deleteQualification(doctorId, q.id);
          load();
        },
      },
    ]);
  };

  // ─── Experience handlers ─────────────────────────────────────────────────────

  const openExpModal = (e?: Experience) => {
    setEditingExp(e ?? null);
    setETitle(e?.title ?? '');
    setEInstitution(e?.institution ?? '');
    setEStartDate(e ? e.startDate.slice(0, 10) : '');
    setEEndDate(e?.endDate ? e.endDate.slice(0, 10) : '');
    setEIsPresent(e?.isPresent ?? false);
    setShowExpModal(true);
  };

  const saveExp = async () => {
    if (!eTitle.trim() || !eInstitution.trim() || !eStartDate) {
      Alert.alert('Required', 'Title, institution and start date are required');
      return;
    }
    try {
      const payload = {
        title: eTitle.trim(),
        institution: eInstitution.trim(),
        startDate: eStartDate,
        endDate: eIsPresent ? undefined : eEndDate || undefined,
        isPresent: eIsPresent,
      };
      if (editingExp) {
        await adminApi.updateExperience(doctorId, editingExp.id, payload);
      } else {
        await adminApi.addExperience(doctorId, payload);
      }
      setShowExpModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed');
    }
  };

  const deleteExp = (e: Experience) => {
    Alert.alert('Delete', `Remove experience at ${e.institution}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await adminApi.deleteExperience(doctorId, e.id);
          load();
        },
      },
    ]);
  };

  // ─── Instruction handlers ────────────────────────────────────────────────────

  const openInstrModal = (i?: Instruction) => {
    setEditingInstr(i ?? null);
    setIName(i?.name ?? '');
    setIStartDate(i ? i.startDate.slice(0, 10) : '');
    setIEndDate(i?.endDate ? i.endDate.slice(0, 10) : '');
    setIIsPresent(i?.isPresent ?? false);
    setShowInstrModal(true);
  };

  const saveInstr = async () => {
    if (!iName.trim() || !iStartDate) {
      Alert.alert('Required', 'Name and start date are required');
      return;
    }
    try {
      const payload = {
        name: iName.trim(),
        startDate: iStartDate,
        endDate: iIsPresent ? undefined : iEndDate || undefined,
        isPresent: iIsPresent,
      };
      if (editingInstr) {
        await adminApi.updateInstruction(doctorId, editingInstr.id, payload);
      } else {
        await adminApi.addInstruction(doctorId, payload);
      }
      setShowInstrModal(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed');
    }
  };

  const deleteInstr = (i: Instruction) => {
    Alert.alert('Delete', `Remove ${i.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await adminApi.deleteInstruction(doctorId, i.id);
          load();
        },
      },
    ]);
  };

  // ─── Availability handlers ───────────────────────────────────────────────────

  const openSlotModal = (
    dayOfWeek: number,
    slot?: AdminDoctorDetail['weeklyAvailability'][number],
  ) => {
    setEditingSlot(slot ?? null);
    setSlotDay(slot?.dayOfWeek ?? dayOfWeek);
    setSlotStart(slot?.startTime ?? '09:00');
    setSlotEnd(slot?.endTime ?? '12:00');
    setSlotMinutes(String(slot?.slotMinutes ?? 30));
    setSlotActive(slot?.isActive ?? true);
    setShowSlotModal(true);
  };

  const saveSlot = async () => {
    if (!slotStart.trim() || !slotEnd.trim()) {
      Alert.alert('Schedule', 'Start and end time are required.');
      return;
    }
    try {
      const payload = {
        dayOfWeek: slotDay,
        startTime: slotStart.trim(),
        endTime: slotEnd.trim(),
        slotMinutes: Number(slotMinutes) || 30,
        isActive: slotActive,
      };
      if (editingSlot) {
        await adminApi.updateWeeklySlot(doctorId, editingSlot.id, payload);
      } else {
        await adminApi.createWeeklySlot(doctorId, payload);
      }
      setShowSlotModal(false);
      load();
    } catch (err) {
      Alert.alert('Schedule', err instanceof ApiError ? err.message : 'Failed to save');
    }
  };

  const deleteSlot = (slot: AdminDoctorDetail['weeklyAvailability'][number]) => {
    Alert.alert(
      'Delete time slot',
      `Remove ${slot.startTime} – ${slot.endTime}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteWeeklySlot(doctorId, slot.id);
              load();
            } catch (err) {
              Alert.alert('Schedule', err instanceof ApiError ? err.message : 'Failed to delete');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: '#64748B'}}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{doctor.user.fullName}</Text>
          <Text style={styles.headerSub}>{doctor.specialtyRef?.name ?? doctor.specialty}</Text>
        </View>
        {(doctor.reviewCount ?? 0) > 0 ? (
          <View style={styles.ratingBadge}>
            <StarRating value={doctor.reviewAverage ?? 0} />
            <Text style={styles.ratingCount}>{doctor.reviewCount}</Text>
          </View>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(t => {
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}>
              <Feather name={t.icon as any} size={16} color={isActive ? '#0D9488' : '#94A3B8'} />
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        key={activeTab}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}>

        {/* ─── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <View style={styles.tabPanel}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.fieldLabel}>Specialty</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowSpecialtyPicker(true)}>
              <Text
                style={
                  selectedSpecialty || doctor.specialty
                    ? styles.pickerValue
                    : styles.pickerPlaceholder
                }>
                {selectedSpecialty?.name ?? doctor.specialty ?? 'Select specialty'}
              </Text>
              <Feather name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.fieldLabel}>Degree</Text>
            <TextInput style={styles.input} value={degree} onChangeText={setDegree} placeholder="MBBS, FCPS..." />
            <Text style={styles.fieldLabel}>Fee (৳)</Text>
            <TextInput style={styles.input} value={fee} onChangeText={setFee} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Registration Number</Text>
            <TextInput style={styles.input} value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="BMDC reg number" />
            <Text style={styles.fieldLabel}>Chamber Address</Text>
            <TextInput style={styles.input} value={chamberAddress} onChangeText={setChamberAddress} placeholder="Chamber location" />
            <Text style={styles.fieldLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
              {['PENDING', 'ACTIVE', 'INACTIVE'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusChip, status === s && styles.statusChipActive]}
                  onPress={() => setStatus(s)}>
                  <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.input, {height: 80, textAlignVertical: 'top', paddingTop: 10}]}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Short doctor biography..."
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Qualifications Tab ──────────────────────────────────────────── */}
        {activeTab === 'qualifications' && (
          <View style={styles.tabPanel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Qualifications</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openQualModal()}>
                <Feather name="plus" size={16} color="#0D9488" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {doctor.qualifications.length === 0 ? (
              <Text style={styles.emptyText}>No qualifications added yet.</Text>
            ) : (
              doctor.qualifications.map(q => (
                <View key={q.id} style={styles.listCard}>
                  <View style={styles.listCardLeft}>
                    <Text style={styles.listCardTitle}>{q.degree}</Text>
                    <Text style={styles.listCardSub}>{q.institution}</Text>
                    {q.fieldOfStudy ? <Text style={styles.listCardMeta}>{q.fieldOfStudy}</Text> : null}
                    {q.yearFrom ? (
                      <Text style={styles.listCardMeta}>
                        {q.yearFrom} – {q.yearTo ?? 'Present'}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.listCardActions}>
                    <TouchableOpacity onPress={() => openQualModal(q)} style={styles.iconAction}>
                      <Feather name="edit-2" size={14} color="#0D9488" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteQual(q)} style={styles.iconAction}>
                      <Feather name="trash-2" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── Experience Tab ───────────────────────────────────────────────── */}
        {activeTab === 'experience' && (
          <View style={styles.tabPanel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openExpModal()}>
                <Feather name="plus" size={16} color="#0D9488" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {doctor.experiences.length === 0 ? (
              <Text style={styles.emptyText}>No experience added yet.</Text>
            ) : (
              doctor.experiences.map(e => (
                <View key={e.id} style={styles.listCard}>
                  <View style={styles.listCardLeft}>
                    <Text style={styles.listCardTitle}>{e.title}</Text>
                    <Text style={styles.listCardSub}>{e.institution}</Text>
                    <Text style={styles.listCardMeta}>
                      {e.startDate.slice(0, 10)} – {e.isPresent ? 'Present' : (e.endDate?.slice(0, 10) ?? '')}
                    </Text>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{e.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.listCardActions}>
                    <TouchableOpacity onPress={() => openExpModal(e)} style={styles.iconAction}>
                      <Feather name="edit-2" size={14} color="#0D9488" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteExp(e)} style={styles.iconAction}>
                      <Feather name="trash-2" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── Instructions Tab ─────────────────────────────────────────────── */}
        {activeTab === 'instructions' && (
          <View style={styles.tabPanel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Training & Certifications</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openInstrModal()}>
                <Feather name="plus" size={16} color="#0D9488" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {doctor.instructions.length === 0 ? (
              <Text style={styles.emptyText}>No training added yet.</Text>
            ) : (
              doctor.instructions.map(i => (
                <View key={i.id} style={styles.listCard}>
                  <View style={styles.listCardLeft}>
                    <Text style={styles.listCardTitle}>{i.name}</Text>
                    <Text style={styles.listCardMeta}>
                      {i.startDate.slice(0, 10)} – {i.isPresent ? 'Present' : (i.endDate?.slice(0, 10) ?? '')}
                    </Text>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{i.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.listCardActions}>
                    <TouchableOpacity onPress={() => openInstrModal(i)} style={styles.iconAction}>
                      <Feather name="edit-2" size={14} color="#0D9488" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteInstr(i)} style={styles.iconAction}>
                      <Feather name="trash-2" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── Availability Tab ─────────────────────────────────────────────── */}
        {activeTab === 'availability' && (
          <View style={styles.tabPanel}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <Text style={styles.scheduleHint}>
              Add multiple time blocks per day (e.g. morning and evening sessions).
            </Text>
            {DAY_LABELS.map((label, dayOfWeek) => {
              const daySlots = doctor.weeklyAvailability
                .filter(w => w.dayOfWeek === dayOfWeek)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <View key={dayOfWeek} style={styles.daySection}>
                  <View style={styles.daySectionHeader}>
                    <Text style={styles.daySectionTitle}>{label}</Text>
                    <TouchableOpacity
                      style={styles.addSlotBtn}
                      onPress={() => openSlotModal(dayOfWeek)}>
                      <Feather name="plus" size={14} color="#0D9488" />
                      <Text style={styles.addSlotBtnText}>Add time</Text>
                    </TouchableOpacity>
                  </View>
                  {daySlots.length === 0 ? (
                    <Text style={styles.dayOff}>No schedule — off day</Text>
                  ) : (
                    daySlots.map(slot => (
                      <View key={slot.id} style={styles.slotRow}>
                        <View style={styles.slotInfo}>
                          <Text style={styles.slotTimeText}>
                            {slot.startTime} – {slot.endTime}
                          </Text>
                          <Text style={styles.slotMetaText}>
                            {slot.slotMinutes} min slots •{' '}
                            {slot.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => openSlotModal(dayOfWeek, slot)}
                          style={styles.iconAction}>
                          <Feather name="edit-2" size={14} color="#0D9488" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteSlot(slot)}
                          style={styles.iconAction}>
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Specialty Picker Modal */}
      <Modal visible={showSpecialtyPicker} animationType="slide" transparent>
        <View style={mst.overlay}>
          <View style={[mst.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={mst.header}>
              <Text style={mst.title}>Select Specialty</Text>
              <TouchableOpacity onPress={() => setShowSpecialtyPicker(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {specialties.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[mst.row, selectedSpecialty?.id === s.id && mst.rowActive]}
                  onPress={() => {setSelectedSpecialty(s); setShowSpecialtyPicker(false);}}>
                  <Text style={[mst.rowText, selectedSpecialty?.id === s.id && mst.rowTextActive]}>
                    {s.name}
                  </Text>
                  {selectedSpecialty?.id === s.id && <Feather name="check" size={16} color="#0D9488" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Slot Modal */}
      <Modal visible={showSlotModal} animationType="slide" transparent>
        <View style={mst.overlay}>
          <View style={[mst.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={mst.header}>
              <Text style={mst.title}>
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </Text>
              <TouchableOpacity onPress={() => setShowSlotModal(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={mst.label}>Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 8}}>
                {DAY_LABELS.map((label, dayOfWeek) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.statusChip, slotDay === dayOfWeek && styles.statusChipActive]}
                    onPress={() => setSlotDay(dayOfWeek)}>
                    <Text
                      style={[
                        styles.statusChipText,
                        slotDay === dayOfWeek && styles.statusChipTextActive,
                      ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={mst.label}>Start time</Text>
              <TimePickerField
                value={slotStart}
                onChange={setSlotStart}
                use24Hour
                pickerTitle="Select start time"
                style={styles.scheduleTimeField}
              />
              <Text style={mst.label}>End time</Text>
              <TimePickerField
                value={slotEnd}
                onChange={setSlotEnd}
                use24Hour
                pickerTitle="Select end time"
                style={styles.scheduleTimeField}
              />
              <Text style={mst.label}>Appointment slot duration</Text>
              <View style={styles.slotMinutesRow}>
                {SLOT_MINUTE_OPTIONS.map(min => (
                  <TouchableOpacity
                    key={min}
                    style={[styles.statusChip, slotMinutes === min && styles.statusChipActive]}
                    onPress={() => setSlotMinutes(min)}>
                    <Text
                      style={[
                        styles.statusChipText,
                        slotMinutes === min && styles.statusChipTextActive,
                      ]}>
                      {min} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.slotActiveRow}>
                <Text style={mst.label}>Active</Text>
                <Switch
                  value={slotActive}
                  onValueChange={setSlotActive}
                  trackColor={{false: '#E2E8F0', true: '#0D9488'}}
                  thumbColor="#FFF"
                />
              </View>
              <TouchableOpacity style={mst.saveBtn} onPress={saveSlot}>
                <Text style={mst.saveBtnText}>Save Time Slot</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Qualification Modal */}
      <Modal visible={showQualModal} animationType="slide" transparent>
        <View style={mst.overlay}>
          <View style={[mst.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={mst.header}>
              <Text style={mst.title}>{editingQual ? 'Edit Qualification' : 'Add Qualification'}</Text>
              <TouchableOpacity onPress={() => setShowQualModal(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={mst.label}>Degree *</Text>
              <TextInput style={mst.input} value={qDegree} onChangeText={setQDegree} placeholder="MBBS, FCPS..." />
              <Text style={mst.label}>Institution *</Text>
              <TextInput style={mst.input} value={qInstitution} onChangeText={setQInstitution} placeholder="Medical College/University" />
              <Text style={mst.label}>Field of Study</Text>
              <TextInput style={mst.input} value={qField} onChangeText={setQField} placeholder="Medicine, Surgery..." />
              <View style={mst.rowFields}>
                <View style={{flex: 1, marginRight: 6}}>
                  <Text style={mst.label}>Year From</Text>
                  <TextInput style={mst.input} value={qYearFrom} onChangeText={setQYearFrom} keyboardType="numeric" placeholder="2010" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={mst.label}>Year To</Text>
                  <TextInput style={mst.input} value={qYearTo} onChangeText={setQYearTo} keyboardType="numeric" placeholder="2016" />
                </View>
              </View>
              <TouchableOpacity style={mst.saveBtn} onPress={saveQual}>
                <Text style={mst.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Experience Modal */}
      <Modal visible={showExpModal} animationType="slide" transparent>
        <View style={mst.overlay}>
          <View style={[mst.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={mst.header}>
              <Text style={mst.title}>{editingExp ? 'Edit Experience' : 'Add Experience'}</Text>
              <TouchableOpacity onPress={() => setShowExpModal(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={mst.label}>Title / Position *</Text>
              <TextInput style={mst.input} value={eTitle} onChangeText={setETitle} placeholder="Senior Cardiologist" />
              <Text style={mst.label}>Institution *</Text>
              <TextInput style={mst.input} value={eInstitution} onChangeText={setEInstitution} placeholder="Hospital/Clinic name" />
              <Text style={mst.label}>Start Date *</Text>
              <DatePickerField
                value={eStartDate}
                onChange={setEStartDate}
                label="Select start date"
                style={styles.modalPickerField}
              />
              <View style={mst.switchRow}>
                <Text style={mst.label}>Currently Working Here</Text>
                <Switch
                  value={eIsPresent}
                  onValueChange={setEIsPresent}
                  trackColor={{false: '#E2E8F0', true: '#0D9488'}}
                  thumbColor="#FFF"
                />
              </View>
              {!eIsPresent && (
                <>
                  <Text style={mst.label}>End Date</Text>
                  <DatePickerField
                    value={eEndDate}
                    onChange={setEEndDate}
                    label="Select end date"
                    style={styles.modalPickerField}
                  />
                </>
              )}
              <TouchableOpacity style={mst.saveBtn} onPress={saveExp}>
                <Text style={mst.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Instruction Modal */}
      <Modal visible={showInstrModal} animationType="slide" transparent>
        <View style={mst.overlay}>
          <View style={[mst.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={mst.header}>
              <Text style={mst.title}>{editingInstr ? 'Edit Training' : 'Add Training'}</Text>
              <TouchableOpacity onPress={() => setShowInstrModal(false)}>
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={mst.label}>Name *</Text>
              <TextInput style={mst.input} value={iName} onChangeText={setIName} placeholder="Course / Certification name" />
              <Text style={mst.label}>Start Date *</Text>
              <DatePickerField
                value={iStartDate}
                onChange={setIStartDate}
                label="Select start date"
                style={styles.modalPickerField}
              />
              <View style={mst.switchRow}>
                <Text style={mst.label}>Ongoing</Text>
                <Switch
                  value={iIsPresent}
                  onValueChange={setIIsPresent}
                  trackColor={{false: '#E2E8F0', true: '#0D9488'}}
                  thumbColor="#FFF"
                />
              </View>
              {!iIsPresent && (
                <>
                  <Text style={mst.label}>End Date</Text>
                  <DatePickerField
                    value={iEndDate}
                    onChange={setIEndDate}
                    label="Select end date"
                    style={styles.modalPickerField}
                  />
                </>
              )}
              <TouchableOpacity style={mst.saveBtn} onPress={saveInstr}>
                <Text style={mst.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {width: 36, alignItems: 'center'},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 16, fontWeight: '700', color: '#1E293B'},
  headerSub: {fontSize: 12, color: '#64748B'},
  ratingBadge: {alignItems: 'center'},
  ratingCount: {fontSize: 10, color: '#64748B', marginTop: 2},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  tabText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {color: '#0D9488', fontWeight: '700'},
  content: {padding: 16},
  tabPanel: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  fieldLabel: {fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, marginTop: 10},
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    color: '#1E293B',
    fontSize: 14,
  },
  picker: {
    backgroundColor: '#FFF',
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
  statusChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  statusChipActive: {backgroundColor: '#0D9488', borderColor: '#0D9488'},
  statusChipText: {fontSize: 12, color: '#475569', fontWeight: '600'},
  statusChipTextActive: {color: '#FFF'},
  saveBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {color: '#FFF', fontWeight: '700', fontSize: 15},
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  addBtnText: {fontSize: 12, fontWeight: '600', color: '#0D9488'},
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listCardLeft: {flex: 1},
  listCardTitle: {fontSize: 14, fontWeight: '700', color: '#1E293B'},
  listCardSub: {fontSize: 12, color: '#475569', marginTop: 2},
  listCardMeta: {fontSize: 11, color: '#94A3B8', marginTop: 2},
  listCardActions: {flexDirection: 'row', gap: 6, marginLeft: 8},
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 4,
  },
  durationText: {fontSize: 10, color: '#0D9488', fontWeight: '600'},
  emptyText: {textAlign: 'center', color: '#94A3B8', marginTop: 20, marginBottom: 10},
  scheduleHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  daySection: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  daySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addSlotBtnText: {fontSize: 12, fontWeight: '600', color: '#0D9488'},
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotInfo: {flex: 1},
  slotTimeText: {fontSize: 14, fontWeight: '600', color: '#1E293B'},
  slotMetaText: {fontSize: 11, color: '#64748B', marginTop: 2},
  slotMinutesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  slotActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scheduleTimeField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  modalPickerField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayLabel: {fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 10, width: 40},
  dayTime: {fontSize: 12, color: '#64748B', flex: 1},
  dayOff: {fontSize: 12, color: '#CBD5E1', flex: 1},
});

const mst = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  title: {fontSize: 16, fontWeight: '700', color: '#1E293B'},
  label: {fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, marginTop: 10},
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    color: '#1E293B',
    fontSize: 14,
  },
  rowFields: {flexDirection: 'row'},
  switchRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10},
  saveBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {color: '#FFF', fontWeight: '700', fontSize: 15},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowActive: {backgroundColor: '#F0FDFA', borderRadius: 8},
  rowText: {fontSize: 14, color: '#1E293B'},
  rowTextActive: {color: '#0D9488', fontWeight: '600'},
});
