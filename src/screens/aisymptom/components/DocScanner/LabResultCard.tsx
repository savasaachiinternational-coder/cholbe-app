import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import type {LabResult} from '../../data/DocScanner/medicalDocument';
import { FONT } from '../../../../theme/typography';

type Props = {
  result: LabResult;
};

function LabResultCardBase({result}: Props) {
  const abnormal = result.isAbnormal === true;
  const value = [result.value, result.unit?.trim()].filter(Boolean).join(' ');

  return (
    <View style={[styles.container, abnormal && styles.containerAbnormal]}>
      <View style={styles.header}>
        <Text style={styles.testName}>{result.testName}</Text>
        {abnormal ? (
          <View style={styles.flag}>
            <Text style={styles.flagLabel}>Out of range</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.value, abnormal && styles.valueAbnormal]}>
        {value}
      </Text>

      {result.referenceRange?.trim() ? (
        <Text style={styles.reference}>
          Reference: {result.referenceRange}
        </Text>
      ) : null}
    </View>
  );
}

export const LabResultCard = React.memo(LabResultCardBase);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  containerAbnormal: {
    backgroundColor: '#FFF4F4',
    borderColor: '#E7A9A9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testName: {
    flex: 1,
    color: '#091B27',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  flag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#D9534F',
  },
  flagLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  value: {
    marginTop: 6,
    color: '#454F5B',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  valueAbnormal: {
    color: '#B23B37',
  },
  reference: {
    marginTop: 4,
    color: '#7E8B97',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
});
