import { Alert } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../config/googleMaps';

export type GeocodedAddress = {
  formattedAddress: string;
  city: string;
  area: string;
  sector: string;
  road: string;
  houseNumber: string;
};

export type RegionDraft = {
  city?: string;
  area?: string;
  sector?: string;
};

const COORDINATE_PATTERN = /^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/;

export function looksLikeCoordinates(text: string): boolean {
  return COORDINATE_PATTERN.test(text.trim());
}

function pickComponent(
  components: Array<{ long_name: string; types: string[] }>,
  ...types: string[]
) {
  const match = components.find(c => types.some(t => c.types.includes(t)));
  return match?.long_name ?? '';
}

function buildFromComponents(
  components: Array<{ long_name: string; types: string[] }>,
  formattedAddress: string,
): GeocodedAddress {
  const city =
    pickComponent(components, 'locality', 'administrative_area_level_2') ||
    'Dhaka';
  const area =
    pickComponent(
      components,
      'sublocality_level_1',
      'sublocality',
      'neighborhood',
      'administrative_area_level_3',
    ) || city;
  const sector =
    pickComponent(
      components,
      'sublocality_level_2',
      'administrative_area_level_4',
    ) || area;
  const road = pickComponent(components, 'route');
  const houseNumber = pickComponent(components, 'street_number');

  const streetLine = [houseNumber, road, area]
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');

  return {
    formattedAddress: streetLine || formattedAddress,
    city,
    area,
    sector,
    road,
    houseNumber,
  };
}

async function reverseGeocodeWithNominatim(
  latitude: number,
  longitude: number,
): Promise<GeocodedAddress | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CholbePharmacyApp/1.0' },
    });
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    if (!data.display_name) {
      return null;
    }

    const addr = data.address ?? {};
    const city = addr.city || addr.state_district || addr.state || 'Dhaka';
    const area =
      addr.suburb || addr.neighbourhood || addr.quarter || addr.town || city;
    const sector = addr.residential || addr.road || area;
    const road = addr.road || '';
    const houseNumber = addr.house_number || '';

    const streetLine = [houseNumber, road, area]
      .map(part => part.trim())
      .filter(Boolean)
      .join(', ');

    return {
      formattedAddress: streetLine || data.display_name,
      city,
      area,
      sector,
      road,
      houseNumber,
    };
  } catch {
    return null;
  }
}

export function regionFallbackAddress(region?: RegionDraft): GeocodedAddress {
  const city = region?.city?.trim() || 'Dhaka';
  const area = region?.area?.trim() || 'Dhaka North';
  const sector = region?.sector?.trim() || 'Uttara Sector 12';

  return {
    formattedAddress: [sector, area, city].filter(Boolean).join(', '),
    city,
    area,
    sector,
    road: '',
    houseNumber: '',
  };
}

/** Geocoding runs through the backend so the Maps key stays off the device. */
async function reverseGeocodeWithGoogle(
  latitude: number,
  longitude: number,
): Promise<GeocodedAddress | null> {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = (await response.json()) as {
      status: string;
      results?: Array<{
        formatted_address: string;
        address_components: Array<{ long_name: string; types: string[] }>;
      }>;
    };

    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }
    const result = data.results[0];
    return buildFromComponents(
      result.address_components,
      result.formatted_address,
    );
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  region?: RegionDraft,
): Promise<GeocodedAddress> {
  const google = await reverseGeocodeWithGoogle(latitude, longitude);
  if (google) {
    return google;
  }

  const nominatim = await reverseGeocodeWithNominatim(latitude, longitude);
  if (nominatim) {
    return nominatim;
  }

  return regionFallbackAddress(region);
}

/** Keep a house/road prefix the user typed before opening the map. */
export function mergeDeliveryAddress(
  userTyped: string,
  geocoded: GeocodedAddress,
): string {
  const typed = userTyped.trim();
  const geocodedLine = geocoded.formattedAddress.trim();

  if (looksLikeCoordinates(typed)) {
    return geocodedLine;
  }

  if (!typed) {
    return geocodedLine;
  }

  if (!geocodedLine) {
    return typed;
  }

  if (geocodedLine.toLowerCase().includes(typed.toLowerCase())) {
    return geocodedLine;
  }

  const looksLikeHousePrefix =
    typed.length <= 24 && !typed.includes(',') && /^[\w\s./#-]+$/i.test(typed);

  if (looksLikeHousePrefix) {
    return `${typed}, ${geocodedLine}`;
  }

  return typed;
}
