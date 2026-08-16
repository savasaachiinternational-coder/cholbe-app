import {useEffect} from 'react';
import {Platform, StatusBar} from 'react-native';

/** Keeps the status bar transparent on Android (avoids the grey scrim band). */
export function useEdgeToEdgeStatusBar() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setBarStyle('dark-content', true);
  }, []);
}
