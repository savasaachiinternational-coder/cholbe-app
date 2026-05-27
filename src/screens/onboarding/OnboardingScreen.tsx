import {useCallback, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {ONBOARDING_GRADIENT, onboardingSlides} from './onboardingData';

const SLIDE_COUNT = onboardingSlides.length;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type Props = {
  /** Last slide "Get Started" */
  onFinish: () => void;
  /** "Sign in" link on slides 2–4 */
  onSignIn: () => void;
};

export function OnboardingScreen({onFinish, onSignIn}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const slide = onboardingSlides[activeIndex];
  const isLastSlide = activeIndex === SLIDE_COUNT - 1;
  const canGoBack = activeIndex > 0;

  const illustrationStyle = slide.imageWidth
    ? {
        width: SCREEN_WIDTH * 0.75,
        height: SCREEN_WIDTH * 0.75 * (slide.imageHeight! / slide.imageWidth),
        maxHeight: SCREEN_WIDTH * 0.65,
      }
    : styles.illustrationFallback;

  const handleBackPress = useCallback(() => {
    if (canGoBack) {
      setActiveIndex(prev => prev - 1);
    }
  }, [canGoBack]);

  const handleNextPress = useCallback(() => {
    if (isLastSlide) {
      onFinish();
      return;
    }
    setActiveIndex(prev => prev + 1);
  }, [isLastSlide, onFinish]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...ONBOARDING_GRADIENT]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + (slide.showHeader ? 0 : 12),
            paddingBottom: insets.bottom + 8,
          },
        ]}>
        {slide.showHeader && (
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.6}
              onPress={handleBackPress}
              disabled={!canGoBack}
              accessibilityLabel="Go back">
              <Text
                style={[
                  styles.backIcon,
                  !canGoBack && styles.backIconDisabled,
                ]}>
                ‹
              </Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerPlaceholder} />
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.textSection}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>

          <View style={styles.imageSection}>
            {slide.image && slide.showFloatingCard ? (
              <View style={styles.illustrationWrapper}>
                <Image
                  source={slide.image}
                  style={styles.illustrationFill}
                  resizeMode="contain"
                />
                <View style={styles.floatingCard}>
                  <Text style={styles.floatingCardText}>
                    {slide.floatingCardText}
                  </Text>
                </View>
              </View>
            ) : slide.image ? (
              <Image
                source={slide.image}
                style={illustrationStyle}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.illustrationPlaceholder} />
            )}
          </View>

          <View style={styles.footerSection}>
            <View style={styles.paginationContainer}>
              {Array.from({length: SLIDE_COUNT}, (_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeIndex && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={handleNextPress}>
              <Text style={styles.buttonText}>
                {isLastSlide ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>

            {slide.showSignIn && (
              <TouchableOpacity
                style={styles.signInLink}
                activeOpacity={0.6}
                onPress={onSignIn}
                accessibilityLabel="Sign in">
                <Text style={styles.signInText}>
                  Already Have an Account?{' '}
                  <Text style={styles.signInHighlight}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ONBOARDING_GRADIENT[0],
  },
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 36,
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: '#333333',
    fontWeight: '300',
  },
  backIconDisabled: {
    opacity: 0.25,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerPlaceholder: {
    width: 36,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B3B3B',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  illustrationWrapper: {
    position: 'relative',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationFill: {
    width: '100%',
    height: '100%',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  floatingCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  illustrationFallback: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.4,
  },
  illustrationPlaceholder: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.4,
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E9F0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4E8D94',
  },
  button: {
    width: '100%',
    backgroundColor: '#4A8B95',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A8B95',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInLink: {
    marginTop: 24,
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 15,
    color: '#555555',
    fontWeight: '400',
  },
  signInHighlight: {
    color: '#4A8B95',
    fontWeight: '600',
  },
});
