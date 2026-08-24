import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import { FONT } from '../../../../theme/typography';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function PainLocationChip({label, selected, onPress}: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      activeOpacity={0.85}
      onPress={onPress}>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 1,
  },
  containerSelected: {
    backgroundColor: '#E36A79',
  },
  label: {
    color: '#454F5B',
    fontSize: 12,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
