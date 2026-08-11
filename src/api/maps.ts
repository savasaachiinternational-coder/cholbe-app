import {apiRequest} from './client';
import {API_BASE_URL} from '../config/api';
import {getAccessToken} from './tokenStorage';

export type GeocodeComponent = {long_name: string; types: string[]};

export type ReverseGeocodeResponse = {
  formattedAddress: string;
  components: GeocodeComponent[];
} | null;

export const mapsApi = {
  reverseGeocode(latitude: number, longitude: number) {
    return apiRequest<ReverseGeocodeResponse>(
      `/maps/reverse-geocode?lat=${latitude}&lng=${longitude}`,
      {auth: true},
    );
  },
};

export type StaticMapParams = {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  scale?: number;
};

export function staticMapUrl({
  latitude,
  longitude,
  zoom = 14,
  width = 600,
  height = 240,
  scale = 2,
}: StaticMapParams) {
  return (
    `${API_BASE_URL}/maps/static?lat=${latitude}&lng=${longitude}` +
    `&zoom=${zoom}&width=${width}&height=${height}&scale=${scale}`
  );
}

/** Image sources need the bearer token as a header since the route is authenticated. */
export async function staticMapImageSource(params: StaticMapParams) {
  const token = await getAccessToken();
  return {
    uri: staticMapUrl(params),
    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
  };
}
