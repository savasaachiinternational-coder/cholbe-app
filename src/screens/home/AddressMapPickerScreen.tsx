import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MapView, {PROVIDER_GOOGLE, type Region} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import { FONT } from '../../theme/typography';
import {
  mergeDeliveryAddress,
  regionFallbackAddress,
  reverseGeocode,
  type GeocodedAddress,
} from '../../utils/geocoding';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressMapPicker'>;

const {width} = Dimensions.get('window');

const DEFAULT_COORDS = {
  latitude: 24.9022,
  longitude: 91.8624,
};

async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function AddressMapPickerScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initial = {
    latitude: route.params?.initialLatitude ?? DEFAULT_COORDS.latitude,
    longitude: route.params?.initialLongitude ?? DEFAULT_COORDS.longitude,
  };
  const [selected, setSelected] = useState(initial);
  const [addressPreview, setAddressPreview] = useState('');
  const [geocoded, setGeocoded] = useState<GeocodedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialRegion: Region = {
    ...initial,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const regionDraft = {
    city: route.params?.draftRegionCity,
    area: route.params?.draftRegionArea,
    sector: route.params?.draftRegionSector,
  };

  const refreshAddressPreview = useCallback(
    async (lat: number, lng: number) => {
      setLoadingAddress(true);
      try {
        const result = await reverseGeocode(lat, lng, regionDraft);
        setGeocoded(result);
        const draft = route.params?.draftFormattedAddress?.trim() ?? '';
        setAddressPreview(mergeDeliveryAddress(draft, result));
      } finally {
        setLoadingAddress(false);
      }
    },
    [
      route.params?.draftFormattedAddress,
      route.params?.draftRegionCity,
      route.params?.draftRegionArea,
      route.params?.draftRegionSector,
    ],
  );

  useEffect(() => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    geocodeTimeoutRef.current = setTimeout(() => {
      void refreshAddressPreview(selected.latitude, selected.longitude);
    }, 350);

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [selected.latitude, selected.longitude, refreshAddressPreview]);

  useEffect(() => {
    void requestLocationPermission().then(setLocationEnabled);
  }, []);

  const handleRegionChangeComplete = (region: Region) => {
    setSelected({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleUseMyLocation = async () => {
    const allowed = await requestLocationPermission();
    setLocationEnabled(allowed);
    if (!allowed || !userLocation) {
      return;
    }
    mapRef.current?.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const confirmLocation = async () => {
    setConfirming(true);
    try {
      const result =
        geocoded ??
        (await reverseGeocode(
          selected.latitude,
          selected.longitude,
          regionDraft,
        ));
      const draft = route.params?.draftFormattedAddress?.trim() ?? '';
      const mergedAddress = mergeDeliveryAddress(draft, result);

      navigation.navigate({
        name: 'CartCheckoutDetails',
        params: {
          addressId: route.params?.addressId,
          pickedLatitude: selected.latitude,
          pickedLongitude: selected.longitude,
          pickedFormattedAddress: mergedAddress,
          pickedRegionCity: result.city,
          pickedRegionArea: result.area,
          pickedRegionSector: result.sector,
          pickedUserName: route.params?.draftUserName,
          pickedUserPhone: route.params?.draftUserPhone,
        },
        merge: true,
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Address</Text>
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleUseMyLocation}
          disabled={!locationEnabled}>
          <Feather name="navigation" size={18} color="#45A096" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={locationEnabled}
          showsMyLocationButton={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          onUserLocationChange={event => {
            const coordinate = event.nativeEvent.coordinate;
            if (coordinate) {
              setUserLocation(coordinate);
            }
          }}
        />
        <View style={styles.centerPinWrap} pointerEvents="none">
          <Feather name="map-pin" size={40} color="#E26D6D" />
        </View>
      </View>

      <View style={[styles.bottomSheet, {paddingBottom: insets.bottom + 16}]}>
        {loadingAddress ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : (
          <Text style={styles.addressText}>
            {addressPreview ||
              regionFallbackAddress(regionDraft).formattedAddress ||
              'Move the map to select your delivery location'}
          </Text>
        )}
        <Text style={styles.coordsText}>
          {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
        </Text>
        <TouchableOpacity
          style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
          onPress={confirmLocation}
          disabled={confirming}>
          {confirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>Use This Location</Text>
          )}
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
  title: {fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#333333'},
  myLocationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {flex: 1, width},
  centerPinWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  loader: {marginBottom: 10},
  addressText: {
    textAlign: 'center',
    color: '#1A1C1E',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 6,
  },
  coordsText: {
    textAlign: 'center',
    color: '#7D8797',
    fontSize: 12,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#45A096',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmText: {color: '#FFFFFF', fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600'},
});
