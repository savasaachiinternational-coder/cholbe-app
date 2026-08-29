import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { FONT } from '../theme/typography';
import {useKeyboardHeight} from '../hooks/useKeyboardHeight';

type Props = {
  visible: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {name: string; relation: string; phone: string}) => void;
};

export function AddEmergencyContactModal({
  visible,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setRelation('');
      setPhone('');
    }
  }, [visible]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedRelation = relation.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedRelation || !trimmedPhone) return;
    onSave({
      name: trimmedName,
      relation: trimmedRelation,
      phone: trimmedPhone,
    });
  };

  const canSave = Boolean(name.trim() && relation.trim() && phone.trim());

  const keyboardHeight = useKeyboardHeight();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, {paddingBottom: keyboardHeight}]} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Add Emergency Contact</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Contact name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Relation</Text>
          <TextInput
            style={styles.input}
            value={relation}
            onChangeText={setRelation}
            placeholder="e.g. Brother, Spouse"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
            activeOpacity={0.9}
            disabled={!canSave || saving}
            onPress={handleSave}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Contact</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  label: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: '#1E293B',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
