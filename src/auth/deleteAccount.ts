import {Alert} from 'react-native';
import {authApi} from '../api/auth';
import {ApiError} from '../api/client';
import {performLogout} from './sessionControl';

/**
 * Two-step confirmation for Play Store account deletion, then API + logout.
 */
export function confirmAndDeleteAccount() {
  Alert.alert(
    'Delete account?',
    'This permanently removes your personal and health data from Cholbe. This cannot be undone.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Confirm deletion',
            'Are you sure you want to delete your account now?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Delete account',
                style: 'destructive',
                onPress: () => {
                  void (async () => {
                    try {
                      await authApi.deleteAccount();
                      await performLogout();
                      Alert.alert(
                        'Account deleted',
                        'Your Cholbe account has been deleted.',
                      );
                    } catch (err) {
                      const message =
                        err instanceof ApiError
                          ? err.message
                          : 'Could not delete account. Please try again.';
                      Alert.alert('Delete account', message);
                    }
                  })();
                },
              },
            ],
          );
        },
      },
    ],
  );
}
