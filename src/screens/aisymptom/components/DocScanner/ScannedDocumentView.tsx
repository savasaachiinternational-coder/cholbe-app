import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {DocumentTypeBadge} from './DocumentTypeBadge';
import {MedicineCard} from './MedicineCard';
import {LabResultCard} from './LabResultCard';
import { FONT } from '../../../../theme/typography';
import {
  DOC_SCANNER_DISCLAIMER,
  type ScannedDocument,
} from '../../data/DocScanner/medicalDocument';

type Props = {
  document: ScannedDocument;
};

function MetaRow({label, value}: {label: string; value?: string}) {
  if (!value?.trim()) return null;
  return (
    <Text style={styles.meta}>
      <Text style={styles.metaLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function ScannedDocumentViewBase({document}: Props) {
  const isPrescription = document.documentType === 'PRESCRIPTION';
  const count = isPrescription
    ? document.medicines.length
    : document.results.length;

  return (
    <View style={styles.container}>
      <DocumentTypeBadge documentType={document.documentType} />

      <View style={styles.metaContainer}>
        <MetaRow label="Patient" value={document.patientName} />
        {isPrescription ? (
          <MetaRow label="Doctor" value={document.doctorName} />
        ) : (
          <MetaRow label="Lab" value={document.labName} />
        )}
      </View>

      <Text style={styles.heading}>
        {isPrescription ? 'Prescribed medicines' : 'Test results'} ({count})
      </Text>

      {count === 0 ? (
        <Text style={styles.empty}>
          {isPrescription
            ? 'No medicines could be read from that page.'
            : 'No test results could be read from that page.'}
        </Text>
      ) : (
        <View style={styles.cardList}>
          {isPrescription
            ? document.medicines.map((medicine, index) => (
                <MedicineCard
                  key={`${medicine.name}-${index}`}
                  medicine={medicine}
                />
              ))
            : document.results.map((result, index) => (
                <LabResultCard
                  key={`${result.testName}-${index}`}
                  result={result}
                />
              ))}
        </View>
      )}

      <Text style={styles.disclaimer}>{DOC_SCANNER_DISCLAIMER}</Text>
    </View>
  );
}

export const ScannedDocumentView = React.memo(ScannedDocumentViewBase);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  metaContainer: {
    marginTop: 10,
    gap: 2,
  },
  meta: {
    color: '#454F5B',
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 20,
  },
  metaLabel: {
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  heading: {
    marginTop: 18,
    color: '#091B27',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  cardList: {
    marginTop: 12,
    gap: 10,
  },
  empty: {
    marginTop: 8,
    color: '#7E8B97',
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    marginTop: 18,
    color: '#7E8B97',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 18,
  },
});
