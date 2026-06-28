import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary, type Asset} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {VendorBottomNav} from './VendorBottomNav';
import {vendorProductsApi} from '../../api/vendorProducts';
import {uploadFile} from '../../api/uploads';
import {ApiError} from '../../api/client';
import {
  PRODUCT_CATEGORIES,
  TEMPERATURE_OPTIONS,
  UNIT_TYPES,
  type ProductCategory,
  type TemperatureOption,
  type UnitType,
} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VAddProduct'>;
type PickerField = 'category' | 'unitType' | 'temperature' | null;

export function VendorAddProductScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [reminderActive, setReminderActive] = useState(true);
  const [category, setCategory] = useState<ProductCategory>('Tablet');
  const [unitType, setUnitType] = useState<UnitType>('Box');
  const [temperature, setTemperature] = useState<TemperatureOption>(TEMPERATURE_OPTIONS[0]);
  const [activePicker, setActivePicker] = useState<PickerField>(null);
  const [productName, setProductName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brand, setBrand] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minAlertLevel, setMinAlertLevel] = useState('10');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1});
    if (result.assets?.[0]) setImageAsset(result.assets[0]);
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Product', 'Product name is required.');
      return;
    }
    const price = parseFloat(unitPrice);
    const stock = parseInt(stockQuantity, 10);
    if (Number.isNaN(price) || price < 0) {
      Alert.alert('Product', 'Enter a valid unit price.');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      Alert.alert('Product', 'Enter a valid stock quantity.');
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageAsset?.uri) {
        const uploaded = await uploadFile(
          '/uploads/product-image',
          imageAsset.uri,
          imageAsset.fileName ?? 'product.jpg',
          imageAsset.type ?? 'image/jpeg',
        );
        imageUrl = uploaded.fileUrl;
      }
      await vendorProductsApi.create({
        name: productName.trim(),
        genericName: genericName.trim() || undefined,
        category,
        brand: brand.trim() || undefined,
        unitPrice: price,
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        stockQuantity: stock,
        minAlertLevel: minAlertLevel ? parseInt(minAlertLevel, 10) : 10,
        expiryDate: expiryDate || undefined,
        batchNumber: batchNumber.trim() || undefined,
        unitType,
        temperature,
        imageUrl,
        prescriptionRequired,
        reminderActive,
      });
      navigation.goBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save product';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const pickerConfig =
    activePicker === 'category'
      ? {title: 'Category', options: PRODUCT_CATEGORIES, selected: category, onSelect: setCategory}
      : activePicker === 'unitType'
        ? {title: 'Unit Type', options: UNIT_TYPES, selected: unitType, onSelect: setUnitType}
        : activePicker === 'temperature'
          ? {
              title: 'Temperature',
              options: TEMPERATURE_OPTIONS,
              selected: temperature,
              onSelect: setTemperature,
            }
          : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>+ Cholbe</Text>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>
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
          {paddingBottom: 100 + insets.bottom},
        ]}>
        <Text style={styles.screenHeading}>Add New Product /Medicine</Text>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.inputLabel}>Product Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="e.g. Amlodipine"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <Text style={styles.inputLabel}>Generic Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={genericName}
              onChangeText={setGenericName}
              placeholder="e.g. Acetaminophen"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                activeOpacity={0.7}
                onPress={() => setActivePicker('category')}>
                <Text style={styles.dropdownText}>{category}</Text>
                <Feather name="chevron-down" size={16} color="#7E8B97" />
              </TouchableOpacity>
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Brand</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Manufacture"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Pricing & Stock</Text>

          <View style={styles.rowFields}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Unit Price</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  placeholder="TK 0.00"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Discounted Price</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={discountPrice}
                  onChangeText={setDiscountPrice}
                  placeholder="TK 0.00"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.rowFields}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Stock Quantity</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  placeholder="e.g. 100"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Min. Alert Level</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={minAlertLevel}
                  onChangeText={setMinAlertLevel}
                  placeholder="e.g. 10"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Inventory Details</Text>

          <View style={styles.rowFields}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.inputBoxWithIcon}>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#1A1C1E"
                />
                <Feather name="calendar" size={16} color="#1A1C1E" />
              </View>
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Batch Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={batchNumber}
                  onChangeText={setBatchNumber}
                  placeholder="e.g. BT-492"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Unit Type</Text>
          <TouchableOpacity
            style={[styles.dropdownBox, styles.dropdownBoxSpaced]}
            activeOpacity={0.7}
            onPress={() => setActivePicker('unitType')}>
            <Text style={styles.dropdownText}>{unitType}</Text>
            <Feather name="chevron-down" size={16} color="#7E8B97" />
          </TouchableOpacity>

          <View style={styles.toggleSectionHeader}>
            <View style={styles.toggleHeaderLeft}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#4E929D" />
              <Text style={styles.toggleSectionTitle}>Prescription & Usage</Text>
              <Text style={styles.toggleSubHint}>Prescription Required</Text>
            </View>
            <Switch
              value={prescriptionRequired}
              onValueChange={setPrescriptionRequired}
              trackColor={{false: '#CBD5E1', true: '#47B39D'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={styles.inputLabel}>Short Description</Text>
          <View style={styles.textAreaBox}>
            <TextInput
              style={styles.textAreaInput}
              placeholder="Brief overview of the product..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.inputLabel}>Side Effects</Text>
          <View style={styles.textAreaBox}>
            <TextInput
              style={styles.textAreaInput}
              placeholder="List common side effects.."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.mediaContainer}>
            <View style={styles.mediaHeader}>
              <Feather name="image" size={18} color="#4E929D" />
              <Text style={styles.mediaTitle}>Product Media</Text>
            </View>
            <TouchableOpacity style={styles.uploadDashedZone} activeOpacity={0.8} onPress={handlePickImage}>
              <MaterialCommunityIcons name="crop-free" size={28} color="#47B39D" />
              <Text style={styles.uploadZoneText}>
                {imageAsset?.fileName ?? 'Upload Image'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.toggleSectionHeader, styles.toggleSectionSpaced]}>
            <View style={styles.toggleHeaderLeft}>
              <MaterialCommunityIcons name="flask-outline" size={20} color="#4E929D" />
              <Text style={styles.toggleSectionTitle}>Reminder to refill Inventory</Text>
            </View>
            <Switch
              value={reminderActive}
              onValueChange={setReminderActive}
              trackColor={{false: '#CBD5E1', true: '#47B39D'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowFields, styles.rowFieldsSpaced]}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Temperature</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                activeOpacity={0.7}
                onPress={() => setActivePicker('temperature')}>
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {temperature}
                </Text>
                <Feather name="chevron-down" size={16} color="#7E8B97" />
              </TouchableOpacity>
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Est. Delivery</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 24-48 Hours"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveProductBtn, saving && styles.buttonDisabled]}
            activeOpacity={0.9}
            disabled={saving}
            onPress={handleSave}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveProductBtnText}>Save Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VendorBottomNav activeTab="inventory" bottomInset={insets.bottom} navigation={navigation} />

      {pickerConfig ? (
        <OptionPickerModal
          visible={activePicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          selected={pickerConfig.selected}
          onSelect={value => {
            pickerConfig.onSelect(value);
            setActivePicker(null);
          }}
          onClose={() => setActivePicker(null)}
        />
      ) : null}
    </View>
  );
}

type OptionPickerModalProps<T extends string> = {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

function OptionPickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionPickerModalProps<T>) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerCard} onPress={e => e.stopPropagation()}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                selected === option && styles.pickerOptionSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect(option)}>
              <Text
                style={[
                  styles.pickerOptionText,
                  selected === option && styles.pickerOptionTextSelected,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#ECEFF3',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F8694',
  },
  logoTextSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#7E8B97',
    fontWeight: '600',
    marginTop: -2,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  screenHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333D47',
    textAlign: 'center',
    marginVertical: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEFF5',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6F767E',
    marginTop: 14,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6F767E',
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 8,
  },
  inputBox: {
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputBoxWithIcon: {
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#1A1C1E',
    padding: 0,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  rowFieldsSpaced: {
    marginBottom: 16,
  },
  flexField: {
    flex: 1,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dropdownBoxSpaced: {
    marginBottom: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: '#1A1C1E',
    marginRight: 8,
  },
  toggleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    marginBottom: 10,
  },
  toggleSectionSpaced: {
    marginTop: 16,
  },
  toggleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  toggleSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333D47',
  },
  toggleSubHint: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  textAreaBox: {
    backgroundColor: '#F4F5F6',
    borderRadius: 12,
    padding: 12,
    height: 100,
    marginBottom: 12,
  },
  textAreaInput: {
    fontSize: 13,
    color: '#1A1C1E',
    textAlignVertical: 'top',
    padding: 0,
    flex: 1,
  },
  mediaContainer: {
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  mediaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333D47',
  },
  uploadDashedZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#47B39D',
    borderRadius: 10,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FAF8',
  },
  uploadZoneText: {
    fontSize: 13,
    color: '#333D47',
    fontWeight: '600',
    marginTop: 8,
  },
  saveProductBtn: {
    backgroundColor: '#3F8694',
    borderRadius: 22,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveProductBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerOptionSelected: {
    backgroundColor: '#E8F4F6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#4F5E6D',
  },
  pickerOptionTextSelected: {
    color: '#3F8694',
    fontWeight: '600',
  },
});
