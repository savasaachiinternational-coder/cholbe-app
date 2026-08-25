// src/components/MedicineScheduleCard.tsx
import { ReactNode } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT } from '../theme/typography';

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
};

/**
 * Medicine schedule card, per Figma:
 *   padding: 16px 12px; gap: 8px; border-radius: 8px;
 *   background: #F5F4FD + wave art; box-shadow: 0 4px 60px rgba(4,6,15,0.08)
 *
 * Three columns: the pill glyph, the title/meta stack, then a right-aligned
 * column holding the time above the action button.
 */
export function MedicineScheduleCard({
  icon,
  title,
  time,
  meta,
  actionLabel = 'View Report',
  onPressAction,
}: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={require('../assets/medicine_cardbg.png')}
        style={styles.cardBg}
        resizeMode="cover"
      />

      <View style={styles.row}>
        <View style={styles.iconSlot}>{icon}</View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

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
        </View>

        <View style={styles.trailing}>
          <Text style={styles.time}>{time}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={onPressAction}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F4FD',
    marginHorizontal:4,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#04060F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  cardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  iconSlot: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1919',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 1,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9F43',
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
    flexShrink: 1,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: '#1B1B1B',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  actionButtonText: {
    color: '#45A096',
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
