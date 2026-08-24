import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import { FONT } from '../../../../theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
};

export function SecondaryPillButton({label, onPress}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 1,
  },
  label: {
    color: '#45A096',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
