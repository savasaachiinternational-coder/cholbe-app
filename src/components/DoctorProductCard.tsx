import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * The doctor card used on DoctorListScreen, extracted so other screens can
 * render an identical one. Styles are copied verbatim from that screen.
 */
export type DoctorProductCardProps = {
  name: string;
  specialty: string;
  degree?: string;
  fee: string;
  rating?: number;
  reviewCount?: number;
  image?: ImageSourcePropType;
  onBook?: () => void;
};

export function DoctorProductCard({
  name,
  specialty,
  degree,
  fee,
  rating,
  reviewCount,
  image,
  onBook,
}: DoctorProductCardProps) {
  return (
    <View style={styles.doctorProductCard}>
      <Image
        source={image ?? require('../assets/profile.png')}
        style={styles.doctorImgCard}
        resizeMode="cover"
      />
      <View style={styles.cardContentBlock}>
        <View style={styles.specialtyBadge}>
          <Text style={styles.specialtyBadgeText}>{specialty}</Text>
        </View>
        <Text style={styles.doctorNameText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.doctorDegreeText} numberOfLines={2}>
          {degree ?? 'Licensed specialist'}
        </Text>
        {(reviewCount ?? 0) > 0 ? (
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={10} color="#FBBF24" />
            <Text style={styles.ratingText}>
              {Number(rating ?? 0).toFixed(1)} ({reviewCount})
            </Text>
          </View>
        ) : null}
        <Text style={styles.feeText}>{fee}</Text>
        <TouchableOpacity
          style={styles.appointmentButton}
          activeOpacity={0.85}
          onPress={onBook}>
          <Text style={styles.appointmentButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  doctorProductCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 4,
  },
  doctorImgCard: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    height: 116,
  },
  cardContentBlock: {
    paddingHorizontal: 4,
    paddingTop: 9,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8BC255',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  specialtyBadgeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#F7FBFE',
  },
  doctorNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  doctorDegreeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#616161',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
    marginTop: -4,
  },
  ratingText: {fontSize: 10, color: '#64748B'},
  feeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  appointmentButton: {
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4DA69F',
    marginBottom: 12,
  },
  appointmentButtonText: {
    color: '#4DA69F',
    fontSize: 12,
    fontWeight: '400',
  },
});
