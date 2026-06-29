import {PermissionsAndroid, Platform} from 'react-native';

export async function requestCallPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ];

  const results = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(
    permission => results[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
}
