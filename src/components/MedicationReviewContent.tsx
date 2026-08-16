import {Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMedicationDraft} from '../context/MedicationDraftContext';
import {
  formatDisplayDate,
  formatFrequencyLabel,
  formatMealTimingLabel,
} from '../utils/medicationDraft';

type Props = {
  styles: Record<string, object>;
};

export function MedicationReviewContent({styles}: Props) {
  const {draft} = useMedicationDraft();

  return (
    <>
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
