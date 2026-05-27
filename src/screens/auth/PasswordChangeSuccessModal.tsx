import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const {width} = Dimensions.get('window');

type Props = {
  visible: boolean;
  onDone: () => void;
};

export function PasswordChangeSuccessModal({visible, onDone}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDone}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.graphicContainer}>
            <View
              style={[styles.decorDot, styles.dotSize1, {top: 10, left: 20}]}
            />
            <View
              style={[styles.decorDot, styles.dotSize2, {top: 15, right: 30}]}
            />
            <View
              style={[
                styles.decorDot,
                styles.dotSize3,
                {bottom: 25, left: 15},
              ]}
            />
            <View
              style={[
                styles.decorDot,
                styles.dotSize2,
                {bottom: 35, right: 25},
              ]}
            />
            <View
              style={[styles.decorDot, styles.dotSize1, {top: 60, right: 10}]}
            />

            <View style={styles.mainSuccessCircle}>
              <View style={styles.checkWhiteCircle}>
                <Feather name="check" size={28} color="#29C79E" />
              </View>
            </View>
          </View>

          <Text style={styles.modalTitle}>
            Successfully{'\n'}Changed
          </Text>
          <Text style={styles.modalSubtitle}>
            Your password was successfully changed
          </Text>

          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.85}
            onPress={onDone}
            accessibilityLabel="Done">
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 48,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  graphicContainer: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  mainSuccessCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#29C79E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkWhiteCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#29C79E',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  decorDot: {
    position: 'absolute',
    backgroundColor: '#A8E7D7',
    borderRadius: 100,
  },
  dotSize1: {width: 14, height: 14},
  dotSize2: {width: 10, height: 10},
  dotSize3: {width: 6, height: 6},
  modalTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4B9F9A',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#4B9F9A',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B9F9A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
