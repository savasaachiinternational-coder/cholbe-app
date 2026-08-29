// src/components/ProductEditSheet.tsx
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {vendorProductsApi} from '../api/vendorProducts';
import {ApiError} from '../api/client';
import {FONT} from '../theme/typography';
import {useKeyboardHeight} from '../hooks/useKeyboardHeight';

// The subset both VendorInventoryScreen's VendorProduct and
// VendorDashboardProduct satisfy, so either list can open this sheet.
export type EditableProduct = {
  id: string;
  name: string;
  genericName?: string | null;
  unitPrice: string | number;
  discountPrice?: string | number | null;
  stockQuantity: number;
  minAlertLevel?: number;
};

type Props = {
  // null keeps the sheet closed; a product opens it seeded with that product.
  product: EditableProduct | null;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_FIELDS = {
  name: '',
  genericName: '',
  unitPrice: '',
  discountPrice: '',
  stockQuantity: '',
  minAlertLevel: '',
};

export function ProductEditSheet({product, onClose, onSaved}: Props) {
  const insets = useSafeAreaInsets();
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [saving, setSaving] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  // The keyboard already covers the safe-area inset while it is up.
  const sheetPaddingBottom =
    keyboardHeight > 0 ? keyboardHeight + 16 : insets.bottom + 16;

  // Reseed whenever a different product is opened.
  useEffect(() => {
    if (!product) return;
    setFields({
      name: product.name,
      genericName: product.genericName ?? '',
      unitPrice: String(product.unitPrice),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stockQuantity: String(product.stockQuantity),
      minAlertLevel:
        product.minAlertLevel === undefined ? '' : String(product.minAlertLevel),
    });
  }, [product]);

  const handleSave = async () => {
    if (!product) return;
    const price = parseFloat(fields.unitPrice);
    const stock = parseInt(fields.stockQuantity, 10);
    if (Number.isNaN(price) || price < 0) {
      Alert.alert('Edit', 'Enter a valid unit price.');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      Alert.alert('Edit', 'Enter a valid stock quantity.');
      return;
    }
    setSaving(true);
    try {
      await vendorProductsApi.update(product.id, {
        name: fields.name.trim(),
        genericName: fields.genericName.trim() || undefined,
        unitPrice: price,
        discountPrice: fields.discountPrice
          ? parseFloat(fields.discountPrice)
          : undefined,
        stockQuantity: stock,
        minAlertLevel: fields.minAlertLevel
          ? parseInt(fields.minAlertLevel, 10)
          : undefined,
      });
      onClose();
      onSaved();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not update product';
      Alert.alert('Edit', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={product !== null}
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.editSheet, {paddingBottom: sheetPaddingBottom}]}
          onPress={e => e.stopPropagation()}>
          <View style={styles.editSheetHandle} />
          <Text style={styles.editSheetTitle}>Edit Product</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.editLabel}>Product Name</Text>
            <TextInput
              style={styles.editInput}
              value={fields.name}
              onChangeText={v => setFields(f => ({...f, name: v}))}
              placeholder="Product Name"
              placeholderTextColor="#A0AEC0"
            />
            <Text style={styles.editLabel}>Generic Name</Text>
            <TextInput
              style={styles.editInput}
              value={fields.genericName}
              onChangeText={v => setFields(f => ({...f, genericName: v}))}
              placeholder="Generic Name"
              placeholderTextColor="#A0AEC0"
            />
            <Text style={styles.editLabel}>Unit Price</Text>
            <TextInput
              style={styles.editInput}
              value={fields.unitPrice}
              onChangeText={v => setFields(f => ({...f, unitPrice: v}))}
              placeholder="0.00"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
            <Text style={styles.editLabel}>Discount Price</Text>
            <TextInput
              style={styles.editInput}
              value={fields.discountPrice}
              onChangeText={v => setFields(f => ({...f, discountPrice: v}))}
              placeholder="0.00"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
            <Text style={styles.editLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.editInput}
              value={fields.stockQuantity}
              onChangeText={v => setFields(f => ({...f, stockQuantity: v}))}
              placeholder="0"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
            <Text style={styles.editLabel}>Min. Alert Level</Text>
            <TextInput
              style={styles.editInput}
              value={fields.minAlertLevel}
              onChangeText={v => setFields(f => ({...f, minAlertLevel: v}))}
              placeholder="e.g. 10"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.saveEditBtn, saving && styles.saveEditBtnDisabled]}
              activeOpacity={0.9}
              disabled={saving}
              onPress={handleSave}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveEditBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  editSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  editSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  editSheetTitle: {
    fontSize: 17,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 12,
    color: '#6F767E',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1A1C1E',
    marginBottom: 4,
  },
  saveEditBtn: {
    backgroundColor: '#3F8694',
    borderRadius: 22,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveEditBtnDisabled: {
    opacity: 0.7,
  },
  saveEditBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
