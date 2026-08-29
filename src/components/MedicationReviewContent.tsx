import {Image, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMedicationDraft} from '../context/MedicationDraftContext';
import {
  formatDisplayDate,
  formatFrequencyLabel,
  formatMealTimingLabel,
} from '../utils/medicationDraft';

const CARD_BG = require('../assets/medicine_cardbg.png');

type Props = {
  styles: Record<string, object>;
};

export function MedicationReviewContent({styles}: Props) {
  const {draft} = useMedicationDraft();

  return (
    <>

      <View style={bg.cardBgClip} pointerEvents="none">
        <Image
          source={CARD_BG}
          style={[bg.cardBg, bg.cardBgLower]}
          resizeMode="cover"
        />
        <Image
          source={CARD_BG}
          style={[bg.cardBg, bg.cardBgUpper]}
          resizeMode="cover"
        />
      </View>

      <View style={styles.metaTitleBlock}>
        <Text style={styles.medicineNameText}>{draft.medicineName || 'Medicine'}</Text>
        <Text style={styles.medicineSubtext}>
          Time to take {formatFrequencyLabel(draft.frequency).toLowerCase()}
        </Text>
      </View>

      <View style={styles.infoBlockRow}>
        <View style={styles.iconColumn}>
          <Feather name="clock" size={20} color="#45A096" />
        </View>
        <View style={styles.detailsColumn}>
          <Text style={styles.sectionLabelText}>Times</Text>
          {draft.times.map(time => (
            <View key={time} style={styles.timelineItem}>
              <View style={styles.orangeDot} />
              <Text style={styles.timelineContentText}>
                {time} ({formatMealTimingLabel(draft.mealTiming)}
                {draft.reminderEnabled
                  ? ` ${draft.reminderBeforeMinutes} min before`
                  : ''}
                )
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dividerLine} />

      <View style={styles.infoBlockRow}>
        <View style={styles.iconColumn}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color="#45A096"
          />
        </View>
        <View style={styles.detailsColumn}>
          <Text style={styles.inlineInfoValueText}>
            Starts : <Text style={styles.boldSpan}>{formatDisplayDate(draft.startDate)}</Text>{' '}
            Ends : <Text style={styles.boldSpan}>{formatDisplayDate(draft.endDate)}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.dividerLine} />

      <View style={styles.infoBlockRow}>
        <View style={styles.iconColumn}>
          <MaterialCommunityIcons name="refresh" size={20} color="#45A096" />
        </View>
        <View style={styles.detailsColumn}>
          <Text style={styles.inlineInfoValueText}>
            Repeats :{' '}
            <Text style={styles.boldSpan}>{formatFrequencyLabel(draft.frequency)}</Text>
          </Text>
        </View>
      </View>

      {draft.followUpEnabled ? (
        <>
          <View style={styles.dividerLine} />
          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <Feather name="eye" size={18} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Follow-up :{' '}
                <Text style={styles.boldSpan}>
                  {draft.followUpMinutes} min before at {draft.followUpTime}
                </Text>
              </Text>
            </View>
          </View>
        </>
      ) : null}

      {draft.refillEnabled ? (
        <>
          <View style={styles.dividerLine} />
          <View style={[styles.infoBlockRow, styles.refillBlock]}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons name="pill" size={20} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.sectionLabelText}>Reminder to refill Inventory :</Text>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>{draft.inventoryCount} pc</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>
                  {draft.refillTime} {formatDisplayDate(draft.refillDate)} (Remind Me when)
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : null}

      {draft.caregiverName ? (
        <>
          <View style={styles.dividerLine} />
          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <Feather name="users" size={18} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Shared with : <Text style={styles.boldSpan}>{draft.caregiverName}</Text>
              </Text>
            </View>
          </View>
        </>
      ) : null}
    </>
  );
}

const bg = StyleSheet.create({
  cardBgClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  cardBg: {
    position: 'absolute',
    left: 0,
    // An explicit width is required here. A left/right pair does NOT size this
    // node: an Image carries intrinsic dimensions, and with aspectRatio set
    // Yoga resolves the box from those instead of from the insets - which
    // pinned it at the asset's own 600dp, overflowing a narrow card in
    // portrait and falling short of a wide one in landscape. The percentage
    // resolves against cardBgClip, which has no padding of its own.
    width: '100%',
    aspectRatio: 600 / 270,   // the asset's real dimensions
    opacity: 0.1,
  },
  // One vertical anchor each: setting top and bottom together would pin the
  // height and fight the aspectRatio.
  cardBgLower: { bottom: 110 },
  cardBgUpper: { top: '10%' },
});
