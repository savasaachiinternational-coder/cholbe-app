import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi, type AdminReview} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AReviews'>;

function StarRow({rating}: {rating: number}) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesome key={i} name="star" size={13} color={i <= rating ? '#FBBF24' : '#CBD5E1'} style={{marginRight: 2}} />
      ))}
      <Text style={{fontSize: 12, color: '#64748B', marginLeft: 4}}>{rating}/5</Text>
    </View>
  );
}

export function AdminReviewsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.reviews();
      setReviews(data);
    } catch (err) {
      Alert.alert('Reviews', err instanceof ApiError ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const deleteReview = (r: AdminReview) => {
    Alert.alert(
      'Delete Review',
      `Delete this ${r.rating}-star review by ${r.appointment.patient.fullName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteReview(r.id);
              load();
            } catch (err) {
              Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed');
            }
          },
        },
      ],
    );
  };

  const filtered = ratingFilter
    ? reviews.filter(r => r.rating === ratingFilter)
    : reviews;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}>
        {/* Summary card */}
        {reviews.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.bigRating}>{avgRating.toFixed(1)}</Text>
              <View style={{flexDirection: 'row', marginVertical: 4}}>
                {[1, 2, 3, 4, 5].map(i => (
                  <FontAwesome
                    key={i}
                    name="star"
                    size={16}
                    color={i <= Math.round(avgRating) ? '#FBBF24' : '#CBD5E1'}
                    style={{marginRight: 2}}
                  />
                ))}
              </View>
              <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
            </View>
            <View style={styles.summaryRight}>
              {ratingCounts.map(({star, count}) => (
                <TouchableOpacity
                  key={star}
                  style={[styles.barRow, ratingFilter === star && styles.barRowActive]}
                  onPress={() => setRatingFilter(prev => (prev === star ? null : star))}>
                  <Text style={styles.barLabel}>{star}</Text>
                  <FontAwesome name="star" size={10} color="#FBBF24" />
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`},
                      ]}
                    />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {ratingFilter ? (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>{ratingFilter}-star filter active</Text>
            <TouchableOpacity onPress={() => setRatingFilter(null)}>
              <Feather name="x" size={14} color="#0D9488" />
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color="#0D9488" style={{marginTop: 32}} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No reviews found.</Text>
        ) : (
          filtered.map(r => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardAuthor}>
                  <View style={styles.avatarCircle}>
                    <Feather name="user" size={14} color="#0D9488" />
                  </View>
                  <View>
                    <Text style={styles.patientName}>{r.appointment.patient.fullName}</Text>
                    <Text style={styles.doctorName}>→ {r.appointment.doctor.user.fullName}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteReview(r)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <StarRow rating={r.rating} />
              {r.comment ? (
                <Text style={styles.commentText}>"{r.comment}"</Text>
              ) : null}
              <Text style={styles.dateText}>
                {new Date(r.createdAt).toLocaleDateString('en-BD', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <AdminBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {width: 32, alignItems: 'center'},
  title: {flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1E293B'},
  content: {padding: 16},
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 16,
  },
  summaryLeft: {alignItems: 'center', justifyContent: 'center', width: 90},
  bigRating: {fontSize: 36, fontWeight: '800', color: '#1E293B'},
  totalReviews: {fontSize: 11, color: '#94A3B8', marginTop: 2},
  summaryRight: {flex: 1},
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  barRowActive: {backgroundColor: '#F0FDFA'},
  barLabel: {fontSize: 11, color: '#475569', width: 10, textAlign: 'right'},
  barTrack: {flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3},
  barFill: {height: 6, backgroundColor: '#FBBF24', borderRadius: 3},
  barCount: {fontSize: 11, color: '#94A3B8', width: 18, textAlign: 'right'},
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  activeFilterText: {fontSize: 13, color: '#0D9488', fontWeight: '600'},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8},
  cardAuthor: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {fontSize: 13, fontWeight: '700', color: '#1E293B'},
  doctorName: {fontSize: 11, color: '#64748B'},
  deleteBtn: {padding: 4},
  commentText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 18,
  },
  dateText: {fontSize: 11, color: '#CBD5E1', marginTop: 4},
  emptyText: {textAlign: 'center', color: '#94A3B8', marginTop: 40},
});
