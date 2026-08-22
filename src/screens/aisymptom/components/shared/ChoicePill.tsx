import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoicePill({label, selected, onPress}: Props) {
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
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  containerSelected: {
    backgroundColor: '#45A096',
  },
  label: {
    color: '#45A096',
    fontSize: 14,
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
