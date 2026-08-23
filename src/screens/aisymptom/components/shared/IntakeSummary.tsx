import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {SymptomIntake} from '../../data/shared/symptomIntake';

type Props = {
  intake: Partial<SymptomIntake>;
};

type Row = {
  key: string;
  iconName: string;
  text: string;
};

function buildRows(intake: Partial<SymptomIntake>): Row[] {
  const rows: Row[] = [];

  if (intake.duration) {
    rows.push({
      key: 'duration',
      iconName: 'clock-outline',
      text: `Duration : ${intake.duration}`,
    });
  }
  if (intake.location) {
    rows.push({
      key: 'Pain In',
      iconName: 'map-marker-outline',
      text: `Pain In : ${intake.location}`,
    });
  }
  if (intake.haveInPrevious !== undefined) {
    rows.push({
      key: 'haveInPrevious',
      iconName: 'history',
      text: `Had before : ${intake.haveInPrevious ? 'Yes' : 'No'}`,
    });
  }

  return rows;
}

export function IntakeSummary({intake}: Props) {
  const rows = buildRows(intake);
  const hasHeader = Boolean(intake.title || intake.body);
  if (!hasHeader && rows.length === 0) return null;

  return (
    <View style={styles.card}>
      <Image
        source={require('../../../../assets/medicine_cardbg.png')}
        style={styles.backgroundWave}
        resizeMode="cover"
      />
      {intake.title ? <Text style={styles.title}>{intake.title}</Text> : null}

      {intake.body ? (
        <View style={styles.bodyBlock}>
          <View style={styles.bodyHeaderRow}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color="#7DCFC4"
            />
            <Text style={styles.bodyHeaderText}>Details</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{intake.body}</Text>
          </View>
        </View>
      ) : null}

      {rows.map((row, index) => (
        <View
          key={row.key}
          style={[
            styles.row,
            (index > 0 || hasHeader) && styles.rowDivided,
          ]}>
          <MaterialCommunityIcons
            name={row.iconName}
            size={18}
            color="#7DCFC4"
          />
          <Text style={styles.rowText}>{row.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F4FD',
    elevation: 1,
    // Clips the wave to the rounded corners.
    overflow: 'hidden',
  },
  backgroundWave: {
    position: 'absolute',
    left: -10,
    right: 0,
    bottom: '10%',
    height: 132,
    width: '160%',
    transform: [{rotate: '-10deg'}],
    opacity: 0.15,
  },
  title: {
    marginTop: 10,
    color: '#1B2B3A',
    fontSize: 17,
    fontWeight: '700',
  },
  bodyBlock: {
    marginTop: 10,
    paddingBottom: 10,
  },
  bodyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bodyHeaderText: {
    color: '#1B2B3A',
    fontSize: 13,
    fontWeight: '600',
  },
  bulletRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    marginTop: 6,
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
  bulletText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: '#E9E7F2',
  },
  rowText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
    fontWeight: '400',
  },
});
