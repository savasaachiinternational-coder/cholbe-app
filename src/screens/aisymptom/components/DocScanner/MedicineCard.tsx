import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import type {Medicine} from '../../data/DocScanner/medicalDocument';
import { FONT } from '../../../../theme/typography';

type Props = {
  medicine: Medicine;
};

/** Rows the model left blank are dropped rather than shown as "N/A" noise. */
function DetailRow({label, value}: {label: string; value?: string}) {
  if (!value?.trim()) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function MedicineCard({medicine}: Props) {
  const hasDetails =
    !!medicine.dosage?.trim() ||
    !!medicine.frequency?.trim() ||
    !!medicine.duration?.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{medicine.name}</Text>
      {hasDetails ? (
        <View style={styles.details}>
          <DetailRow label="Dosage" value={medicine.dosage} />
          <DetailRow label="Frequency" value={medicine.frequency} />
          <DetailRow label="Duration" value={medicine.duration} />
        </View>
      ) : (
        <Text style={styles.noDetails}>No dosage details detected</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  name: {
    color: '#091B27',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  details: {
    marginTop: 10,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowLabel: {
    width: 78,
    color: '#7E8B97',
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  rowValue: {
    flex: 1,
    color: '#454F5B',
    fontSize: 13,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 18,
  },
  noDetails: {
    marginTop: 6,
    color: '#9AA6B2',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
