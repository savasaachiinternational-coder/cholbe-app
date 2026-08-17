import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  iconName: string;
  title: string;
  onPress?: () => void;
};

export function AiHelpCategoryCard({iconName, title, onPress}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}>
      <MaterialCommunityIcons name={iconName} size={44} color="#1B2B3A" />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 118,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEAF7',
    backgroundColor: '#FBFAFE',
  },
  title: {
    color: '#091B27',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});