import {StyleSheet, Text, View, type DimensionValue} from 'react-native';
import React from 'react';
import type {ConditionSuggestion} from '../../data/SymptomResultScreen/symptomResults';
import { FONT } from '../../../../theme/typography';

function confidenceColors(confidence: number) {
  if (confidence >= 70) return {fill: '#17962F', track: '#E5EAE6'};
  if (confidence >= 50) return {fill: '#E36A79', track: '#FBDEDE'};
  return {fill: '#E03B52', track: '#FDE7EA'};
}

type Props = {
  condition: ConditionSuggestion;
};

function ConditionCardBase({condition}: Props) {
  const {fill, track} = confidenceColors(condition.confidence);
  const width: DimensionValue = `${Math.max(
    0,
    Math.min(100, condition.confidence),
  )}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {condition.name} – {condition.confidence}
        {condition.labelConfidence ? '% confidence' : '%'}
      </Text>

      <View style={[styles.track, {backgroundColor: track}]}>
        <View style={[styles.fill, {width, backgroundColor: fill}]} />
      </View>

      {condition.description ? (
        <Text style={styles.description}>{condition.description}</Text>
      ) : null}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Severity</Text>
        <Text style={styles.detailValue}>{condition.severity}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Triggers</Text>
        <Text style={styles.detailValue}>{condition.triggers}</Text>
      </View>
    </View>
  );
}

export const ConditionCard = React.memo(ConditionCardBase);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F4FD',
  },
  title: {
    color: '#091B27',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  track: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  description: {
    marginTop: 12,
    color: '#8A939C',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 18,
  },
  detailRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    width: 92,
    color: '#8A939C',
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  detailValue: {
    flex: 1,
    color: '#091B27',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
