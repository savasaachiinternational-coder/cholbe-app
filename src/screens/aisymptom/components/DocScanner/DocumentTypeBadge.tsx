import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import type {ScannedDocument} from '../../data/DocScanner/medicalDocument';
import { FONT } from '../../../../theme/typography';

type Props = {
  documentType: ScannedDocument['documentType'];
};

const LABELS: Record<ScannedDocument['documentType'], string> = {
  PRESCRIPTION: 'Prescription',
  LAB_REPORT: 'Lab test report',
};

function DocumentTypeBadgeBase({documentType}: Props) {
  const isPrescription = documentType === 'PRESCRIPTION';
  return (
    <View style={[styles.container, isPrescription ? styles.rx : styles.lab]}>
      <Text style={styles.label}>{LABELS[documentType]}</Text>
    </View>
  );
}

export const DocumentTypeBadge = React.memo(DocumentTypeBadgeBase);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  rx: {
    backgroundColor: '#45A096',
  },
  lab: {
    backgroundColor: '#7FA8C9',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
