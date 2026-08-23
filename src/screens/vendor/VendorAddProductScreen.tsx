import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
import {NotificationBell} from '../../components/NotificationBell';
import {WaveWithChild} from '../../components/WaveWithChild';
import {DatePickerField} from '../../components/MedicationPickers';
import {
  PRODUCT_CATEGORIES,
  TEMPERATURE_OPTIONS,
  isMedicineCategory,
  unitTypesForCategory,
  type ProductCategory,
  type TemperatureOption,
  type UnitType,
} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VAddProduct'>;
type PickerField = 'category' | 'unitType' | 'temperature' | null;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

// Figma "Card/Shadow 1": 0 4px 60px 0 rgba(4, 6, 15, 0.08).
const CARD_SHADOW = {
  shadowColor: '#04060F',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.08,
  shadowRadius: 30,
  elevation: 2,
} as const;

export function VendorAddProductScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [reminderActive, setReminderActive] = useState(true);
  const [category, setCategory] = useState<ProductCategory>('Tablet');
  const [unitType, setUnitType] = useState<UnitType>('Piece');
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

  const handleCategoryChange = (next: ProductCategory) => {
    setCategory(next);
    const units = unitTypesForCategory(next);
    setUnitType(units[0] as UnitType);
    setPrescriptionRequired(isMedicineCategory(next));
    if (!isMedicineCategory(next)) {
      setReminderActive(false);
    }
  };

  const availableUnitTypes = unitTypesForCategory(category);
  const showMedicineFields = isMedicineCategory(category);

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
      ? {
          title: 'Category',
          options: PRODUCT_CATEGORIES,
          selected: category,
          onSelect: (value: ProductCategory) => handleCategoryChange(value),
        }
      : activePicker === 'unitType'
        ? {
            title: 'Sell Unit',
            options: availableUnitTypes,
            selected: unitType,
            onSelect: setUnitType,
          }
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
          <Feather name="chevron-left" size={26} color="#212121" />
        </TouchableOpacity>
        <Image
          source={require('../../assets/logoImage.png')}
          style={styles.logoImage}
        />
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 100 + insets.bottom},
        ]}>
        <View style={styles.waveHost}>
          <WaveWithChild color="#F4F1FD" style={styles.waveContent}>
            <Text style={styles.screenHeading}>Add New Product /Medicine</Text>
          </WaveWithChild>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.inputLabel}>Product Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="e.g. Amlodipine"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <Text style={styles.inputLabel}>Generic Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={genericName}
              onChangeText={setGenericName}
              placeholder="e.g. Acetaminophen"
              placeholderTextColor="#9E9E9E"
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
                <Feather name="chevron-down" size={20} color="#616161" />
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
                  placeholderTextColor="#9E9E9E"
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
                  placeholderTextColor="#9E9E9E"
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
                  placeholderTextColor="#9E9E9E"
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
                  placeholder="e.g. 100 Boxes"
                  placeholderTextColor="#9E9E9E"
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
                  placeholderTextColor="#9E9E9E"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Inventory Details</Text>

          <View style={styles.rowFields}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <DatePickerField
                value={expiryDate}
                onChange={setExpiryDate}
                compact
                placeholder="Select date"
                style={styles.expiryDateField}
              />
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>Batch Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  value={batchNumber}
                  onChangeText={setBatchNumber}
                  placeholder="e.g. BT-492"
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Sell Unit</Text>
          <TouchableOpacity
            style={[styles.dropdownBox, styles.dropdownBoxSpaced]}
            activeOpacity={0.7}
            onPress={() => setActivePicker('unitType')}>
            <Text style={styles.dropdownText}>{unitType}</Text>
            <Feather name="chevron-down" size={20} color="#616161" />
          </TouchableOpacity>
          <Text style={styles.fieldHint}>
            {showMedicineFields
              ? 'Choose Piece, Stripe, or Box — customers can buy in that pack size.'
              : 'Choose Bottle, Tube, Pack, etc. — customers buy one unit at a time.'}
          </Text>

          {showMedicineFields ? (
          <View style={styles.blockCard}>
            <View style={styles.blockHeaderRow}>
              <View style={styles.blockIconTile}>
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={18}
                  color="#4DA69F"
                />
              </View>
              <Text style={styles.blockTitle}>Prescription & Usage</Text>
              <Text style={styles.blockHint}>Prescription Required</Text>
              <ToggleSwitch
                value={prescriptionRequired}
                onValueChange={setPrescriptionRequired}
              />
            </View>

            <Text style={styles.inputLabel}>Short Description</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Brief overview of the product..."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
              />
            </View>

            <Text style={styles.inputLabel}>Side Effects</Text>
            <View style={[styles.textAreaBox, styles.textAreaBoxLast]}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="List common side effects.."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
          ) : null}

          <View style={styles.blockCard}>
            <View style={styles.blockHeaderRow}>
              <View style={styles.blockIconTile}>
                <Feather name="image" size={16} color="#4DA69F" />
              </View>
              <Text style={styles.blockTitle}>Product Media</Text>
            </View>
            <TouchableOpacity
              style={styles.uploadDashedZone}
              activeOpacity={0.8}
              onPress={handlePickImage}>
              {imageAsset?.uri ? (
                <Image
                  source={{uri: imageAsset.uri}}
                  style={styles.uploadedPreview}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="crop-free"
                    size={32}
                    color="#4DA69F"
                  />
                  <Text style={styles.uploadZoneText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.blockCard}>
            <View style={styles.blockHeaderRow}>
              <View style={styles.blockIconTile}>
                <MaterialCommunityIcons
                  name="flask-outline"
                  size={18}
                  color="#4DA69F"
                />
              </View>
              <Text style={styles.blockTitle}>Reminder to refill Inventory</Text>
              <ToggleSwitch
                value={reminderActive}
                onValueChange={setReminderActive}
              />
            </View>

            <View style={styles.rowFields}>
              {showMedicineFields ? (
              <View style={styles.flexField}>
                <Text style={styles.inputLabel}>Temperature</Text>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  activeOpacity={0.7}
                  onPress={() => setActivePicker('temperature')}>
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {temperature}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#616161" />
                </TouchableOpacity>
              </View>
              ) : null}
              <View style={styles.flexField}>
                <Text style={styles.inputLabel}>Est. Delivery</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 24-48 Hours"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={saving}
            onPress={handleSave}>
            <LinearGradient
              colors={['#5CB0AA', '#3E8D94']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[styles.saveProductBtn, saving && styles.buttonDisabled]}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveProductBtnText}>Save Product</Text>
              )}
            </LinearGradient>
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

// Figma: 40 x 22 track, 16px knob, Primary-500 on / Greyscale-300 off.
function ToggleSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggleTrack,
        value ? styles.toggleTrackOn : styles.toggleTrackOff,
      ]}>
      <View style={styles.toggleKnob} />
    </TouchableOpacity>
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
          {options.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                index === options.length - 1 && styles.pickerOptionLast,
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
    backgroundColor: '#F4F1FD',
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  logoImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerButton: {
    padding: 2,
    width: 32,
  },

  // ---- Wave title band ----
  waveHost: {
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  waveContent: {
    paddingTop:10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    paddingBottom: 8,
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-900.
  screenHeading: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#212121',
    textAlign: 'center',
  },

  // ---- Form card ----
  formContainer: {
    backgroundColor: '#F5F4FD',
    borderRadius: 24,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 16,
    ...CARD_SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
    marginTop: 14,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    marginBottom: 6,
    marginTop: 8,
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    marginBottom: 8,
    lineHeight: 17,
  },
  // Figma: 12px radius, 1px Greyscale-300, white well.
  inputBox: {
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expiryDateField: {
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#212121',
    padding: 0,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dropdownBoxSpaced: {
    marginBottom: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#212121',
    marginRight: 8,
  },

  // ---- Nested blocks ----
  blockCard: {
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginTop: 16,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockIconTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTitle: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  blockHint: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    letterSpacing: 0.2,
  },
  textAreaBox: {
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    height: 100,
    marginBottom: 8,
  },
  textAreaBoxLast: {
    marginBottom: 0,
  },
  textAreaInput: {
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#212121',
    textAlignVertical: 'top',
    padding: 0,
    flex: 1,
  },
  uploadDashedZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#4DA69F',
    borderRadius: 12,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F2FE',
    marginTop: 12,
    overflow: 'hidden',
  },
  uploadedPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadZoneText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
    marginTop: 8,
  },

  // ---- Toggle ----
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: '#4DA69F',
    alignItems: 'flex-end',
  },
  toggleTrackOff: {
    backgroundColor: '#E0E0E0',
    alignItems: 'flex-start',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  // ---- Save ----
  saveProductBtn: {
    borderRadius: 100,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  saveProductBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // ---- Option picker ----
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    paddingVertical: 4,
    maxHeight: '70%',
    ...CARD_SHADOW,
  },
  pickerTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2EF',
  },
  pickerOptionLast: {
    borderBottomWidth: 0,
  },
  pickerOptionSelected: {
    backgroundColor: '#E6F3F5',
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  pickerOptionTextSelected: {
    color: '#4DA69F',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
