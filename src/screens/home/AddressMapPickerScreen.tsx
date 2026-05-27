import {useState} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MapView, {Marker, UrlTile} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressMapPicker'>;

const {width} = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 26.0337,
  longitude: 88.4617,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export function AddressMapPickerScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [marker, setMarker] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Address</Text>
        <View style={styles.headerSpacer} />
      </View>

      <MapView style={styles.map} initialRegion={INITIAL_REGION}>
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />
        <Marker
          coordinate={marker}
          draggable
          onDragEnd={event => {
            setMarker(event.nativeEvent.coordinate);
          }}
          title="Delivery location"
        />
      </MapView>

      <View style={[styles.bottomSheet, {paddingBottom: insets.bottom + 16}]}>
        <Text style={styles.coordsText}>
          {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
        </Text>
        <TouchableOpacity style={styles.confirmButton} onPress={() => navigation.goBack()}>
          <Text style={styles.confirmText}>Use This Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {padding: 2},
  title: {fontSize: 20, fontWeight: '600', color: '#333333'},
  headerSpacer: {width: 28},
  map: {flex: 1, width},
  bottomSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  coordsText: {
    textAlign: 'center',
    color: '#7D8797',
    fontSize: 13,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#45A096',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
});
