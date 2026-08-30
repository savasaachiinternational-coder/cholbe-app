import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { FONT } from '../../../../theme/typography';

type Props = {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
};

function AiSymptomHeaderCardBase({
  title = 'ideated AI',
  subtitle = 'Describe feel, AI will guide you step-by-step',
  onClose,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/medicine_cardbg.png')}
        style={styles.backgroundWave}
        resizeMode="cover"
        fadeDuration={0}
      />
      <Image
        source={require('../../../../assets/syaiicon.png')}
        style={styles.aiIcon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        hitSlop={10}
        onPress={onClose}
        style={styles.closeButton}>
        <Feather name="x" color="#5F6B76" size={18} />
      </TouchableOpacity>
    </View>
  );
}

export const AiSymptomHeaderCard = React.memo(AiSymptomHeaderCardBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    padding: 12,
    backgroundColor: '#F2FFFC',
    overflow: 'hidden',
    borderRadius: 10,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 1,
  },
  backgroundWave: {
    ...StyleSheet.absoluteFill,
    paddingTop:20,
    top:20,
    height: '110%',
    width: '110%',
    opacity: 0.1,
    transform:[{rotate: '-10deg'}]
  },
  aiIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  title: {
    color: '#091B27',
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    color: '#454F5B',
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 20,
  },
});
