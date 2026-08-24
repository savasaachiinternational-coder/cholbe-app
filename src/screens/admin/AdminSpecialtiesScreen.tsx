import {useCallback, useState} from 'react';
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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ASpecialties'>;

type SpecialtyRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export function AdminSpecialtiesScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<SpecialtyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.specialties();
      setItems(data);
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const create = async () => {
    if (!name.trim()) return;
    try {
      await adminApi.createSpecialty({name: name.trim()});
      setName('');
      load();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Create failed');
    }
  };

  const toggle = async (item: SpecialtyRow) => {
    try {
      await adminApi.updateSpecialty(item.id, {isActive: !item.isActive});
      load();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.deleteSpecialty(id);
      load();
    } catch (err) {
      Alert.alert('Specialties', err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Specialties</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}>
        <View style={styles.createRow}>
          <TextInput
            style={styles.input}
            placeholder="New specialty name"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.addBtn} onPress={create}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#0D9488" style={{marginTop: 24}} />
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.slug}</Text>
              </View>
              <TouchableOpacity style={styles.smallBtn} onPress={() => toggle(item)}>
                <Text style={styles.smallBtnText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.dangerBtn]} onPress={() => remove(item.id)}>
                <Feather name="trash-2" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <AdminBottomNav activeTab="user" bottomInset={insets.bottom} navigation={navigation} />
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
  },
  iconBtn: {width: 32},
  title: {flex: 1, textAlign: 'center', fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  content: {padding: 16},
  createRow: {flexDirection: 'row', gap: 8, marginBottom: 16},
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  addBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: {color: '#FFF', fontFamily: FONT.semibold, fontWeight: '600'},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  cardSub: {fontSize: 12, color: '#64748B', marginTop: 2},
  smallBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  smallBtnText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#0D9488'},
  dangerBtn: {borderColor: '#FECACA'},
});
