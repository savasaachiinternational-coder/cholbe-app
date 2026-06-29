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

type Props = {
  visible: boolean;
  initialBloodPressure?: string;
  initialOxygen?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {bloodPressure?: string; oxygen?: string}) => void;
};

export function UpdateHealthVitalsModal({
  visible,
  initialBloodPressure = '',
  initialOxygen = '',
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [bloodPressure, setBloodPressure] = useState(initialBloodPressure);
  const [oxygen, setOxygen] = useState(initialOxygen);

  useEffect(() => {
    if (visible) {
      setBloodPressure(initialBloodPressure);
      setOxygen(initialOxygen.replace(/%$/, ''));
    }
  }, [visible, initialBloodPressure, initialOxygen]);

  const handleSave = () => {
    const bp = bloodPressure.trim();
    const o2 = oxygen.trim();
    if (!bp && !o2) return;
    onSave({
      bloodPressure: bp || undefined,
      oxygen: o2 || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Update Health Status</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Blood Pressure</Text>
          <TextInput
            style={styles.input}
            value={bloodPressure}
            onChangeText={setBloodPressure}
            placeholder="e.g. 120/80"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Oxygen Level</Text>
          <View style={styles.oxygenRow}>
            <TextInput
              style={[styles.input, styles.oxygenInput]}
              value={oxygen}
              onChangeText={setOxygen}
              placeholder="e.g. 98"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.percentLabel}>%</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.9}
            disabled={saving}
            onPress={handleSave}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Vitals</Text>
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
    fontWeight: '700',
    color: '#1E293B',
  },
  label: {
    fontSize: 13,
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
  oxygenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oxygenInput: {
    flex: 1,
  },
  percentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    minWidth: 20,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#408E91',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
