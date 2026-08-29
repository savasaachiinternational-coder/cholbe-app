import {useEffect, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

/**
 * Height the on-screen keyboard currently covers, in dp. 0 when it is hidden.
 *
 * The app targets SDK 36, and from API 35 Android enforces edge-to-edge and
 * ignores the manifest's `windowSoftInputMode="adjustResize"` - the window no
 * longer shrinks for the IME, so a `KeyboardAvoidingView` that relies on that
 * resize has nothing to react to. An RN `Modal` is its own Android window
 * besides, so it would not inherit the Activity's soft-input mode even on an
 * older target.
 *
 * Reading the reported keyboard height and padding by it works in both cases,
 * and cannot double-count because nothing else is resizing.
 *
 * iOS gets the `will` events so the padding animates in step with the
 * keyboard; Android only emits the `did` pair.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, event =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}
