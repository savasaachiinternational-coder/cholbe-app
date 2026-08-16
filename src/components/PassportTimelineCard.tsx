import {ReactNode} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export function formatPassportListTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  let hours = d.getHours();
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}.${minutes} ${meridiem}`;
}

type MetaItem = {
  label: string;
};

type Props = {
  icon: ReactNode;
  title: string;
  time: string;
  meta: MetaItem[];
  actionLabel?: string;
  onPressAction?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export function PassportTimelineCard({
  icon,
  title,
  time,
  meta,
  actionLabel = 'View Report',
  onPressAction,
  isFirst,
  isLast,
}: Props) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, isFirst && styles.timelineDotActive]} />
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.waveDecorator1} />
        <View style={styles.waveDecorator2} />

        <View style={styles.cardInner}>
          <View style={styles.iconSlot}>{icon}</View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.time}>{time}</Text>
            </View>

            <View style={styles.metaRow}>
              {meta.map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.metaItem}>
                  <View style={styles.orangeDot} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={onPressAction}>
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  timelineRail: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
    paddingTop: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B8D4D1',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: '#45A096',
    borderColor: '#45A096',
  },
  timelineLine: {
    position: 'absolute',
    top: 30,
    bottom: -14,
    width: 2,
    backgroundColor: '#D7E5E3',
    borderRadius: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#C5D0E3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 118,
  },
  waveDecorator1: {
    position: 'absolute',
    right: -18,
    top: -22,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#D9EEF9',
    opacity: 0.55,
  },
  waveDecorator2: {
    position: 'absolute',
    right: 28,
    bottom: -36,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E4E8FA',
    opacity: 0.65,
  },
  cardInner: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
  },
  iconSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
  },
  time: {
    fontSize: 11,
    color: '#8A94A6',
    fontWeight: '500',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    maxWidth: '48%',
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9F43',
    marginRight: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#5A6578',
    fontWeight: '500',
    flexShrink: 1,
  },
  actionRow: {
    alignItems: 'flex-end',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  actionButtonText: {
    color: '#45A096',
    fontSize: 12,
    fontWeight: '600',
  },
});
