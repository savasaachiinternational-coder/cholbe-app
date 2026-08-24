import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FONT } from '../../../../theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function GradientPillButton({label, onPress, disabled}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}>
      <LinearGradient
        colors={['#45A096', '#7FA8C9']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.container, disabled && styles.containerDisabled]}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:40,
  },
  containerDisabled: {
    opacity: 0.45,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
