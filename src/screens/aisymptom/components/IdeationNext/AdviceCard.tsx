import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT } from '../../../../theme/typography';

type Props = {
  iconName: string;
  title: string;
  bullets?: string[];
  body?: string;
};

function AdviceCardBase({iconName, title, bullets, body}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name={iconName} size={16} color="#45A096" />
        <Text style={styles.title}>{title}</Text>
      </View>

      {bullets?.map(bullet => (
        <View key={bullet} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}

      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

export const AdviceCard = React.memo(AdviceCardBase);

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F4FD',
    elevation:1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#424242',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  bulletRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    color: '#8A939C',
    fontSize: 11,
    lineHeight: 17,
  },
  bulletText: {
    flex: 1,
    color: '#616161',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 17,
  },
  body: {
    marginTop: 8,
    color: '#616161',
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
});
